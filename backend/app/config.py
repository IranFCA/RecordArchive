from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Justice Archive Platform API"
    debug: bool = True
    database_url: str = "postgresql+psycopg://jap_user:change_me@db:5432/jap"
    secret_key: str = "your-secret-key-change-in-production"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
