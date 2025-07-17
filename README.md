![HTML5](https://img.shields.io/badge/HTML5-e34f26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Self-Hosted](https://img.shields.io/badge/self--hosted-yes-brightgreen?style=for-the-badge)

# 🔄 Morfeu – Universal File Converter

A fully self-hosted file conversion interface that lets you drag and drop images, media, spreadsheets, and more — and convert them in one click.

---

## 💡 About the Project

**Morfeu** is a lightweight, containerized frontend for converting files of various types. Built entirely with HTML, CSS, and JavaScript, it interfaces with dedicated backend APIs (image, spreadsheet, media) to process conversions and offer instant downloads.

Inspired by limitations of online tools, this was created to:

- Handle multiple file types in one place.
- Offer offline/private usage.
- Be fast, clean, and easy to use.

---

## 🎯 Purpose

- ✅ **Personal**: A secure, intuitive tool for our home server to convert files with full control.
- 🚀 **Professional**: A demonstration of frontend skills, Docker setup, and seamless UX focused on performance and usability.

---

## 🖼️ Preview

![Morfeu Screenshot](/assets/homepage.png)

---

## 🧠 Features

- **Drag & Drop Interface** – Easily select or drop multiple files.
- **Automatic Detection** – Detects type (image, audio, video, spreadsheet) and shows format options.
- **Batch Conversion** – Convert all files at once or individually.
- **Progress Feedback** – Real-time progress bar and estimated time.
- **Abort + Remove Options** – Cancel any ongoing conversion.
- **Multi-format Support** – Convert to dozens of formats per type.
- **ZIP Download** – Download all results in one ZIP file.
- **Toast Notifications** – Clean and responsive user feedback.

---

## 🧪 Supported File Types

- **Images**: JPG, PNG, TIFF, BMP, WEBP, ICO, HEIC, PSD, etc.
- **Audio**: MP3, WAV, FLAC, M4A, OGG, AAC, AMR, etc.
- **Video**: MP4, MKV, AVI, MOV, WEBM, etc.
- **Spreadsheets**: CSV, XLSX, JSON, XML, Parquet, HDF5, etc.

---

## 🚀 Running Locally with Docker

### Requirements

- Docker
- A reverse proxy (e.g. Traefik) listening on `traefik-net`
- Backend APIs running on ports:

  - `3000` → Image converter [github/image_converter](https://github.com/kelwynOliveira/image_converter)
  - `3001` → Spreadsheet converter [github/image_converter](https://github.com/kelwynOliveira/spreadsheet_converter)
  - `3002` → Media converter [github/image_converter](https://github.com/kelwynOliveira/media_converter)

### docker-compose.yml

```yaml
services:
  morfeu:
    container_name: morfeu
    restart: unless-stopped
    build:
      context: .
      dockerfile: Dockerfile
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.morfeu.rule=Host(`morfeu.like`)"
      - "traefik.http.routers.morfeu.entrypoints=web"
      - "traefik.http.services.morfeu.loadbalancer.server.port=80"
    networks:
      - traefik-net
    ports:
      - "2005:80"
    volumes:
      - .:/usr/share/nginx/html

networks:
  traefik-net:
    external: true
```

Then run:

```bash
docker-compose up -d --build
```

The app will be available at:

```
http://morfeu.like
```

Or via localhost:

```
http://localhost:2005
```

---

## 🗂️ File Structure (Simplified)

```
├── index.html          # Main interface
├── styles.css          # UI styling
├── scripts.js          # Conversion logic and interactions
├── Dockerfile          # NGINX base setup
├── docker-compose.yml  # Container configuration
├── public/assets/      # Logo, favicon, screenshots
```

---

## 🧠 How It Works

1. The frontend reads dropped/selected files.
2. Based on extension, it defines the file type.
3. Sends file via `fetch()` to the correct API endpoint.
4. Streams the response and updates the progress bar.
5. On success, download becomes available (or bundled in a ZIP).

> Example URL for image:
>
> ```
> http://192.168.1.100:3000/convert_image/?output_format=png
> ```

---

## 🔒 Privacy

- No external requests (besides Google Fonts and JSZip CDN).
- Runs entirely in your local network.
- Perfect for private use, schools, or offline environments.

---

## 📌 Notes

- You are free to connect your own backends.
- Easily adaptable to use FastAPI, Flask, or Node.js as APIs.
- Fully static – no database or server logic required.

---

## 🧱 Technologies

- HTML5
- CSS3 (modern + responsive)
- Vanilla JavaScript (with `fetch`, `FileReader`, `Blob`, etc.)
- Docker + NGINX
- JSZip (via CDN)
