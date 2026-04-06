from datetime import datetime
from secrets import token_hex

from sqlalchemy.orm import Session, joinedload

from . import models, schemas


def _generate_case_number() -> str:
    return f"JAP-{datetime.utcnow().strftime('%Y%m%d')}-{token_hex(3).upper()}"


def create_submission(db: Session, payload: schemas.SubmissionCreate) -> models.Submission:
    submission = models.Submission(
        case_number=_generate_case_number(),
        title=payload.title,
        description=payload.description,
        relationship_type=payload.relationship_type,
        country=payload.country,
        source_basis=payload.source_basis,
        date_range_start=payload.date_range_start,
        date_range_end=payload.date_range_end,
        submitter_contact=str(payload.submitter_contact) if payload.submitter_contact else None,
        is_anonymous=payload.is_anonymous,
        status=models.CaseStatus.UNREVIEWED,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_submissions(db: Session) -> list[models.Submission]:
    submissions = db.query(models.Submission).options(
        joinedload(models.Submission.evidence_items)
    ).order_by(models.Submission.created_at.desc()).all()

    # Populate files field from evidence_items
    for submission in submissions:
        submission.files = [evidence.file_name for evidence in submission.evidence_items]

    return submissions


def get_submission(db: Session, submission_id):
    submission = db.query(models.Submission).options(
        joinedload(models.Submission.evidence_items)
    ).filter(models.Submission.id == submission_id).first()

    if submission:
        submission.files = [evidence.file_name for evidence in submission.evidence_items]

    return submission


def update_submission_status(db: Session, submission: models.Submission, status: models.CaseStatus):
    submission.status = status
    db.commit()
    db.refresh(submission)

    # Reload evidence_items and populate files
    db.refresh(submission, ['evidence_items'])
    submission.files = [evidence.file_name for evidence in submission.evidence_items]

    return submission


def delete_submission(db: Session, submission_id):
    submission = get_submission(db, submission_id)
    if not submission:
        return False

    db.delete(submission)
    db.commit()
    return True


def get_user_by_email(db: Session, email: str) -> models.User | None:
    """Get a user by email address."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, email: str, password: str, role: models.UserRole = models.UserRole.REVIEWER) -> models.User:
    """Create a new user."""
    from .api.auth import get_password_hash

    user = models.User(
        email=email,
        password_hash=get_password_hash(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, email: str) -> bool:
    """Delete a user by email address."""
    user = get_user_by_email(db, email)
    if not user:
        return False

    db.delete(user)
    db.commit()
    return True


def create_contact(db: Session, payload: schemas.ContactCreate) -> models.Contact:
    """Create a new contact message."""
    contact = models.Contact(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def list_contacts(db: Session) -> list[models.Contact]:
    """List all contact messages."""
    return db.query(models.Contact).order_by(models.Contact.created_at.desc()).all()


def delete_contact(db: Session, contact_id: str) -> bool:
    """Delete a contact message by ID."""
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not contact:
        return False

    db.delete(contact)
    db.commit()
    return True


def update_submission_notes(db: Session, submission_id, notes: str) -> bool:
    """Update investigator notes for a submission."""
    submission = get_submission(db, submission_id)
    if not submission:
        return False

    submission.investigator_notes = notes
    db.commit()
    return True


def create_evidence(db: Session, submission_id, file_name: str, file_type: str, file_hash: str | None, storage_path: str) -> models.Evidence:
    """Create a new evidence record."""
    evidence = models.Evidence(
        submission_id=submission_id,
        file_name=file_name,
        file_type=file_type,
        file_hash=file_hash,
        storage_path=storage_path
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence
