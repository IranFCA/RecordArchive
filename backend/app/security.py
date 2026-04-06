"""
Security utilities for Justice Archive Platform
Includes antivirus scanning and captcha verification
"""
import os
import tempfile
import logging
from typing import Dict, Any, Optional
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

class AntivirusScanner:
    """Antivirus scanning using ClamAV (optional)"""

    def __init__(self):
        self.available = False
        try:
            import pyclamd
            self.cd = pyclamd.ClamdUnixSocket()
            # Test connection
            if self.cd.ping():
                self.available = True
                logger.info("ClamAV antivirus scanner initialized successfully")
            else:
                logger.warning("ClamAV daemon not responding")
        except ImportError:
            logger.warning("pyclamd package not installed - antivirus scanning disabled")
        except Exception as e:
            logger.warning(f"ClamAV not available: {e}")
            logger.info("Antivirus scanning will be simulated for development")

    def scan_file(self, file_path: str) -> Dict[str, Any]:
        """
        Scan a file for viruses
        Returns: {"safe": bool, "threats": list, "details": dict}
        """
        if not self.available:
            logger.warning("Antivirus scanning not available - ClamAV not configured")
            return {"safe": True, "threats": [], "details": {"scanner": "unavailable"}}

        try:
            result = self.cd.scan(file_path)
            if result:
                # ClamAV found something
                threats = []
                for file_path_result, status in result.items():
                    if status[0] == 'FOUND':
                        threats.append({
                            "file": os.path.basename(file_path_result),
                            "threat": status[1],
                            "severity": "high"
                        })

                return {
                    "safe": len(threats) == 0,
                    "threats": threats,
                    "details": {
                        "scanner": "clamav",
                        "result": result
                    }
                }
            else:
                # No threats found
                return {
                    "safe": True,
                    "threats": [],
                    "details": {
                        "scanner": "clamav",
                        "result": "clean"
                    }
                }
        except Exception as e:
            logger.error(f"Antivirus scan failed: {e}")
            return {
                "safe": False,
                "threats": [{"error": f"Scan failed: {str(e)}"}],
                "details": {"scanner": "clamav", "error": str(e)}
            }

    def scan_file_content(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Scan file content directly (without saving to disk)
        """
        if not self.available:
            return {"safe": True, "threats": [], "details": {"scanner": "unavailable"}}

        # Create temporary file for scanning
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{filename}") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        try:
            return self.scan_file(temp_file_path)
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass


class CaptchaVerifier:
    """Cloudflare Turnstile verification"""

    def __init__(self, secret_key: str, verify_url: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"):
        self.secret_key = secret_key
        self.verify_url = verify_url

    def verify_token(self, token: str, remote_ip: Optional[str] = None) -> Dict[str, Any]:
        """
        Verify Turnstile token
        Returns: {"success": bool, "errors": list}
        """
        try:
            data = {
                "secret": self.secret_key,
                "response": token
            }
            if remote_ip:
                data["remoteip"] = remote_ip

            response = requests.post(self.verify_url, data=data, timeout=10)
            result = response.json()

            return {
                "success": result.get("success", False),
                "hostname": result.get("hostname"),
                "challenge_ts": result.get("challenge_ts"),
                "errors": result.get("error-codes", [])
            }
        except Exception as e:
            logger.error(f"CAPTCHA verification failed: {e}")
            return {
                "success": False,
                "errors": [f"Verification failed: {str(e)}"]
            }


# Global instances
antivirus_scanner = AntivirusScanner()

def get_captcha_verifier() -> CaptchaVerifier:
    """Get CAPTCHA verifier instance"""
    secret_key = os.getenv("TURNSTILE_SECRET_KEY")
    if not secret_key:
        logger.warning("TURNSTILE_SECRET_KEY not set - CAPTCHA verification disabled")
        secret_key = "dummy_key"  # Will fail verification but won't crash
    return CaptchaVerifier(secret_key)


def scan_uploaded_file(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Scan uploaded file content for viruses
    """
    return antivirus_scanner.scan_file_content(file_content, filename)


def verify_captcha_token(token: str, remote_ip: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify reCAPTCHA token
    """
    verifier = get_captcha_verifier()
    return verifier.verify_token(token, remote_ip)