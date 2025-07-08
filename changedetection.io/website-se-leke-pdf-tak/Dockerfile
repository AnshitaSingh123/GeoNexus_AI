FROM python:3.10-slim

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libxrender1 \
    libxext6 \
    libjpeg62-turbo \
    libpng-dev \
    libssl-dev \
    libx11-dev \
    xfonts-75dpi \
    xfonts-base \
    wkhtmltopdf \
    && pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["python", "webhook_server.py"]
