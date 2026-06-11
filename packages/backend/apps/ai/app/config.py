from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    deepseek_api_key: str
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_chat_model: str = "deepseek-chat"

    mongodb_host: str = "mongodb"
    mongodb_port: int = 27017
    mongodb_user: str = "mongo_user"
    mongodb_password: str = "mongo_password"
    mongodb_db: str = "transvirex"

    delivery_service_url: str = "http://transvirex-delivery-service:3000"

    port: int = 5000

    @property
    def mongodb_url(self) -> str:
        return (
            f"mongodb://{self.mongodb_user}:{self.mongodb_password}"
            f"@{self.mongodb_host}:{self.mongodb_port}"
            f"/{self.mongodb_db}?authSource=admin"
        )

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
