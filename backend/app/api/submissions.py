from uuid import UUID
from typing import List
import hashlib
import aiofiles
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.security import scan_uploaded_file, verify_captcha_token

router = APIRouter(prefix="/submissions", tags=["submissions"])

# File upload restrictions (as per README)
ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt'
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_TOTAL_SIZE = 50 * 1024 * 1024  # 50MB
MAX_FILES = 5

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file against security restrictions."""
    # Check file type
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES.keys())}"
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File {file.filename} too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

def validate_files(files: List[UploadFile]) -> None:
    """Validate all uploaded files."""
    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too many files. Maximum: {MAX_FILES} files"
        )

    total_size = 0
    for file in files:
        if file.filename:  # Skip empty files
            validate_file(file)
            file.file.seek(0, 2)
            total_size += file.file.tell()
            file.file.seek(0)

    if total_size > MAX_TOTAL_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total upload size too large. Maximum: {MAX_TOTAL_SIZE // (1024*1024)}MB"
        )


@router.post("", response_model=schemas.SubmissionRead, status_code=status.HTTP_201_CREATED)
def create_submission(payload: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    return crud.create_submission(db, payload)


@router.get("", response_model=list[schemas.SubmissionRead])
def list_submissions(db: Session = Depends(get_db)):
    return crud.list_submissions(db)


@router.get("/{submission_id}", response_model=schemas.SubmissionRead)
def get_submission(submission_id: UUID, db: Session = Depends(get_db)):
    submission = crud.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.patch("/{submission_id}/status", response_model=schemas.SubmissionRead)
def update_status(submission_id: UUID, payload: schemas.SubmissionUpdateStatus, db: Session = Depends(get_db)):
    submission = crud.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return crud.update_submission_status(db, submission, payload.status)


@router.delete("/{submission_id}")
def delete_submission(submission_id: UUID, db: Session = Depends(get_db)):
    success = crud.delete_submission(db, submission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission deleted successfully"}


@router.patch("/{submission_id}/notes")
def update_investigator_notes(submission_id: UUID, payload: dict, db: Session = Depends(get_db)):
    """
    Update investigator notes for a submission
    """
    notes = payload.get("investigator_notes", "")
    success = crud.update_submission_notes(db, submission_id, notes)
    if not success:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Notes updated successfully"}


@router.get("/{submission_id}/files/{filename}")
async def download_file(submission_id: UUID, filename: str, db: Session = Depends(get_db)):
    """Download a file from a submission."""
    # Find the evidence record by submission_id and file_name
    evidence = db.query(models.Evidence).filter(
        models.Evidence.submission_id == submission_id,
        models.Evidence.file_name == filename
    ).first()

    if not evidence:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = Path("uploads") / evidence.storage_path

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    # Basic security check - ensure file is in uploads directory
    if not str(file_path.resolve()).startswith(str(Path("uploads").resolve())):
        raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(
        path=file_path,
        filename=filename,  # Use original filename
        media_type=evidence.file_type or 'application/octet-stream'
    )


@router.post("/upload", response_model=schemas.SubmissionRead, status_code=status.HTTP_201_CREATED)
async def create_submission_with_files(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    relationship_type: str = Form("unknown"),
    country: str | None = Form(None),
    source_basis: str | None = Form(None),
    date_range_start: str | None = Form(None),
    date_range_end: str | None = Form(None),
    submitter_contact: str | None = Form(None),
    is_anonymous: bool = Form(True),
    captcha_token: str = Form(...),
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Create a new submission with file uploads, antivirus scanning, and CAPTCHA verification
    """
    try:
        # 1. Verify CAPTCHA
        captcha_result = verify_captcha_token(captcha_token, request.client.host if request.client else None)
        if not captcha_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CAPTCHA verification failed: {', '.join(captcha_result.get('errors', ['Unknown error']))}"
            )

        # 2. Validate and scan files
        if files:
            validate_files(files)

            # Scan each file for viruses
            for file in files:
                if file.filename:
                    # Read file content
                    content = await file.read()
                    await file.seek(0)  # Reset file pointer

                    # Scan for viruses
                    scan_result = scan_uploaded_file(content, file.filename)
                    if not scan_result["safe"]:
                        threats = scan_result.get("threats", [])
                        threat_names = [t.get("threat", "Unknown") for t in threats if isinstance(t, dict)]
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File {file.filename} failed security scan. Threats detected: {', '.join(threat_names)}"
                        )

        # 3. Save files to disk (if any)
        saved_files = []
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)

        if files:
            for file in files:
                if file.filename:
                    # Generate secure filename with hash
                    file_content = await file.read()
                    file_hash = hashlib.sha256(file_content).hexdigest()[:16]
                    file_ext = ALLOWED_FILE_TYPES.get(file.content_type, ".bin")
                    secure_filename = f"{file_hash}_{file.filename}"

                    file_path = upload_dir / secure_filename
                    async with aiofiles.open(file_path, 'wb') as f:
                        await f.write(file_content)

                    saved_files.append(secure_filename)

        # 4. Create submission record
        submission_data = schemas.SubmissionCreate(
            title=title,
            description=description,
            relationship_type=relationship_type,
            country=country,
            source_basis=source_basis,
            date_range_start=date_range_start,
            date_range_end=date_range_end,
            submitter_contact=submitter_contact,
            is_anonymous=is_anonymous,
            captcha_token=captcha_token,
            files=saved_files
        )

        submission = crud.create_submission(db, submission_data)

        # 5. Create evidence records for uploaded files
        if saved_files:
            for saved_file in saved_files:
                # Extract hash and original filename
                if '_' in saved_file:
                    file_hash, original_filename = saved_file.split('_', 1)
                else:
                    file_hash = None
                    original_filename = saved_file

                # Determine file type from extension
                file_ext = original_filename.split('.')[-1].lower() if '.' in original_filename else 'bin'
                file_type_map = {
                    'pdf': 'application/pdf',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'txt': 'text/plain'
                }
                file_type = file_type_map.get(file_ext, 'application/octet-stream')

                crud.create_evidence(db, submission.id, original_filename, file_type, file_hash, saved_file)

        return submission

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Submission failed: {str(e)}"
        )


@router.post("/verify-captcha", response_model=schemas.CaptchaResponse)
async def verify_captcha(payload: schemas.CaptchaVerify, request: Request):
    """
    Verify reCAPTCHA token
    """
    result = verify_captcha_token(payload.token, request.client.host if request.client else None)
    return schemas.CaptchaResponse(
        success=result["success"],
        challenge_ts=result.get("challenge_ts"),
        hostname=result.get("hostname"),
        error_codes=result.get("errors", [])
    )
