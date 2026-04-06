from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.security import verify_captcha_token

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=schemas.ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(payload: schemas.ContactCreate, request: Request, db: Session = Depends(get_db)):
    """
    Create a new contact message with CAPTCHA verification
    """
    try:
        # Verify CAPTCHA
        captcha_result = verify_captcha_token(payload.captcha_token, request.client.host if request.client else None)
        if not captcha_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CAPTCHA verification failed: {', '.join(captcha_result.get('errors', ['Unknown error']))}"
            )

        return crud.create_contact(db, payload)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contact submission failed: {str(e)}"
        )


@router.get("", response_model=list[schemas.ContactRead])
def list_contacts(db: Session = Depends(get_db)):
    """
    List all contact messages (admin only - should be protected in production)
    """
    return crud.list_contacts(db)


@router.delete("/{contact_id}")
def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    """
    Delete a contact message by ID
    """
    success = crud.delete_contact(db, contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted successfully"}
