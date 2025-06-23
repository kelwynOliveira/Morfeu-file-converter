// Configurações da API
function get_api_url(file_type) {
  const API_URL_IMAGE = "http://192.168.1.100:3000/convert_image/";
  const API_URL_SPREADSHEET = "http://192.168.1.100:3001/convert_spreadsheet/";
  const API_URL_MIDIA = "http://192.168.1.100:3002/convert_midia/";

  if (file_type === "image") return API_URL_IMAGE;
  else if (file_type === "video" || file_type === "audio") return API_URL_MIDIA;
  else return API_URL_SPREADSHEET;
}

// Dados globais
const fileData = [];
const controllers = {};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
});

function initializeEventListeners() {
  const fileInput = document.getElementById("file-input");
  const uploadArea = document.getElementById("upload-area");

  // Event listeners para upload
  fileInput.addEventListener("change", handleFileSelect);

  // Drag and drop
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function processFiles(files) {
  let validFiles = 0;

  files.forEach((file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const fileType = getFileType(ext);

    if (!fileType) {
      showToast(`Tipo de arquivo não suportado: ${file.name}`, "error");
      return;
    }

    addFile(file);
    validFiles++;
  });

  if (validFiles > 0) {
    renderFiles();
    showFilesSection();
    showToast(`${validFiles} arquivo(s) adicionado(s) com sucesso!`, "success");
  }
}

function generateUUID() {
  // Polyfill para crypto.randomUUID se não estiver disponível
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para uma função de geração de UUID baseada em Math.random
  // Esta função gera um UUID v4 (aleatório)
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function addFile(file) {
  // const id = crypto.randomUUID();
  const id = generateUUID();
  const ext = file.name.split(".").pop().toLowerCase();
  const fileType = getFileType(ext);
  const outputOptions = getOutputOptions(fileType, ext);

  fileData.push({
    id,
    file,
    fileType,
    originalExt: ext,
    outputFormat: outputOptions[0] || "",
    progress: 0,
    blob: null,
    filename: null,
    status: "pending", // pending, converting, completed, error
  });
}

function getFileType(extension) {
  const imageExt = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tiff",
    "ico",
    "psd",
    "eps",
    "jp2",
    "jpc",
    "dds",
    "ppm",
    "pgm",
    "pbm",
    "pcx",
    "tga",
    "xbm",
    "xpm",
  ];
  const audioExt = [
    "mp3",
    "wav",
    "m4a",
    "flac",
    "ogg",
    "aac",
    "wma",
    "ac3",
    "aiff",
    "amr",
  ];
  const videoExt = [
    "mp4",
    "avi",
    "mkv",
    "mov",
    "webm",
    "flv",
    "wmv",
    "mpeg",
    "mpg",
    "3gp",
    "ogv",
    "vob",
    "ts",
    "m2ts",
    "asf",
    "swf",
  ];
  const spreadsheetExt = [
    "csv",
    "xls",
    "xlsx",
    "json",
    "xml",
    "html",
    "htm",
    "parquet",
    "feather",
    "hdf5",
    "dta",
    "ods",
    "por",
    "sas7bdat",
    "sav",
    "sas",
  ];

  if (imageExt.includes(extension)) return "image";
  if (audioExt.includes(extension)) return "audio";
  if (videoExt.includes(extension)) return "video";
  if (spreadsheetExt.includes(extension)) return "spreadsheet";

  return null;
}

function getOutputOptions(fileType, currentExt) {
  const options = {
    image: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "ico"],
    audio: ["mp3", "wav", "ogg", "aac", "flac", "m4a"],
    video: ["mp4", "mov", "avi", "mkv", "webm", "mp3", "wav", "ogg", "aac"],
    spreadsheet: ["csv", "xls", "xlsx", "ods", "json", "html", "xml"],
  };

  return (options[fileType] || []).filter((ext) => ext !== currentExt);
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(fileType) {
  const icons = {
    image: "🖼️",
    video: "🎬",
    audio: "🎵",
    spreadsheet: "📊",
  };
  return icons[fileType] || "📄";
}

function showFilesSection() {
  document.getElementById("files-section").style.display = "block";
}

function renderFiles() {
  const grid = document.getElementById("files-grid");
  grid.innerHTML = "";

  fileData.forEach((data) => {
    const card = createFileCard(data);
    grid.appendChild(card);
  });
}

function createFileCard(data) {
  const card = document.createElement("div");
  card.className = "file-card";
  card.setAttribute("data-file-id", data.id);

  const outputOptions = getOutputOptions(data.fileType, data.originalExt);

  card.innerHTML = `
      <div class="file-header">
          <div class="file-icon ${data.fileType}">
              ${getFileIcon(data.fileType)}
          </div>
          <div class="file-info">
              <div class="file-name">${data.file.name}</div>
              <div class="file-size">${formatFileSize(data.file.size)}</div>
          </div>
      </div>
      
      <div class="file-actions">
          <select class="format-select" id="format-${data.id}">
              ${outputOptions
                .map(
                  (opt) =>
                    `<option value="${opt}" ${
                      opt === data.outputFormat ? "selected" : ""
                    }>${opt.toUpperCase()}</option>`
                )
                .join("")}
          </select>
      </div>
      
      <div class="progress-container">
          <div class="progress-bar">
              <div class="progress-fill" style="width: ${data.progress}%"></div>
          </div>
          <div class="progress-text" id="progress-text-${data.id}">
              ${getProgressText(data)}
          </div>
      </div>
      
      <div class="file-controls">
          <button class="btn btn-primary btn-small" onclick="convertFile('${
            data.id
          }')" 
                  ${data.status === "converting" ? "disabled" : ""}>
              <span class="btn-icon">${
                data.status === "converting" ? "⏳" : "▶️"
              }</span>
              ${data.status === "converting" ? "Convertendo..." : "Converter"}
          </button>
          
          ${
            data.blob
              ? `<a href="${URL.createObjectURL(data.blob)}" download="${
                  data.filename
                }" class="btn btn-secondary btn-small">
                  <span class="btn-icon">📥</span> Download
              </a>`
              : '<span class="btn btn-secondary btn-small" style="opacity: 0.5;">📥 Download</span>'
          }
          
          <button class="btn btn-secondary btn-small" onclick="removeFile('${
            data.id
          }')">
              <span class="btn-icon">🗑️</span>
          </button>
          
          ${
            data.status === "converting"
              ? `<button class="btn btn-secondary btn-small" onclick="cancelConvert('${data.id}')">
                  <span class="btn-icon">❌</span> Cancelar
              </button>`
              : ""
          }
      </div>
  `;

  // Event listener para mudança de formato
  const select = card.querySelector(`#format-${data.id}`);
  select.addEventListener("change", (e) => {
    data.outputFormat = e.target.value;
  });

  return card;
}

function getProgressText(data) {
  switch (data.status) {
    case "pending":
      return "Aguardando...";
    case "converting":
      return data.remainingTime
        ? `⏳ ${data.remainingTime}s`
        : `${data.progress}%`;
    case "completed":
      return "✅ Concluído";
    case "error":
      return "❌ Erro";
    default:
      return `${data.progress}%`;
  }
}

function removeFile(id) {
  const index = fileData.findIndex((f) => f.id === id);
  if (index !== -1) {
    // Cancelar conversão se estiver em andamento
    if (controllers[id]) {
      controllers[id].abort();
      delete controllers[id];
    }

    fileData.splice(index, 1);
    renderFiles();

    if (fileData.length === 0) {
      document.getElementById("files-section").style.display = "none";
    }

    showToast("Arquivo removido!", "success");
  }
}

async function convertFile(id) {
  const data = fileData.find((f) => f.id === id);
  if (!data) return;

  const outputOptions = getOutputOptions(data.fileType, data.originalExt);
  if (!outputOptions.includes(data.outputFormat)) {
    showToast(`Formato de saída inválido para ${data.file.name}`, "error");
    return;
  }

  const controller = new AbortController();
  controllers[id] = controller;

  data.status = "converting";
  data.progress = 5;
  renderFiles();

  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("output_format", data.outputFormat);

  const API_URL = get_api_url(data.fileType);

  try {
    const response = await fetch(
      API_URL + "?output_format=" + data.outputFormat,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao converter ${data.file.name}`);
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength) : null;

    if (!response.body) {
      throw new Error("ReadableStream não disponível.");
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      if (total) {
        const percent = Math.floor((received / total) * 100);
        data.progress = Math.min(percent, 95);
      } else {
        data.progress = Math.min(data.progress + 5, 90);
      }

      // Calcular tempo estimado
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = received / elapsed;
      const remaining = total ? (total - received) / speed : null;

      data.remainingTime = remaining ? Math.ceil(remaining) : null;

      updateFileProgress(id);
    }

    const blob = new Blob(chunks);
    const filename =
      data.file.name.split(".").slice(0, -1).join(".") +
      "." +
      data.outputFormat;

    data.blob = blob;
    data.filename = filename;
    data.progress = 100;
    data.status = "completed";
    data.remainingTime = null;

    renderFiles();
    showToast(`${data.file.name} convertido com sucesso!`, "success");
  } catch (error) {
    if (error.name === "AbortError") {
      data.status = "pending";
      data.progress = 0;
      showToast(`Conversão de ${data.file.name} cancelada`, "warning");
    } else {
      console.error(error);
      data.status = "error";
      data.progress = 0;
      showToast(`Erro ao converter ${data.file.name}`, "error");
    }
    renderFiles();
  } finally {
    delete controllers[id];
  }
}

function updateFileProgress(id) {
  const data = fileData.find((f) => f.id === id);
  if (!data) return;

  const progressFill = document.querySelector(
    `[data-file-id="${id}"] .progress-fill`
  );
  const progressText = document.getElementById(`progress-text-${id}`);

  if (progressFill) progressFill.style.width = data.progress + "%";
  if (progressText) progressText.textContent = getProgressText(data);
}

function cancelConvert(id) {
  if (controllers[id]) {
    controllers[id].abort();
    delete controllers[id];
  }
}

function convertAll() {
  const pendingFiles = fileData.filter((f) => f.status === "pending");

  if (pendingFiles.length === 0) {
    showToast("Nenhum arquivo pendente para conversão!", "warning");
    return;
  }

  showToast(
    `Iniciando conversão de ${pendingFiles.length} arquivo(s)...`,
    "success"
  );
  pendingFiles.forEach((f) => convertFile(f.id));
}

function downloadAll() {
  const completedFiles = fileData.filter((f) => f.blob);

  if (completedFiles.length === 0) {
    showToast("Nenhum arquivo convertido para download!", "warning");
    return;
  }

  if (completedFiles.length === 1) {
    // Download direto se for apenas um arquivo
    const file = completedFiles[0];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.blob);
    link.download = file.filename;
    link.click();
    showToast("Download iniciado!", "success");
    return;
  }

  // Criar ZIP para múltiplos arquivos
  const zip = new JSZip();

  completedFiles.forEach((f) => {
    zip.file(f.filename, f.blob);
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "arquivos_convertidos.zip";
    link.click();
    showToast(
      `Download de ${completedFiles.length} arquivo(s) iniciado!`,
      "success"
    );
  });
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">
              ${type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}
          </span>
          <span>${message}</span>
      </div>
  `;

  container.appendChild(toast);

  // Auto remove após 4 segundos
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 4000);
}
