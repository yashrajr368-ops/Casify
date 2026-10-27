from backend.extensions import db
from backend.models.notification import Notification

def create_notification(user_id, title, message, notif_type='info'):
    """Helper to persist a notification for a specific user."""
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return None
