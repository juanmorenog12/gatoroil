
if (typeof L === "undefined") {
  const mapEl = document.getElementById("map");
  if (mapEl) {
    mapEl.innerHTML = `
      <div style="
        height:100%;
        display:grid;
        place-items:center;
        padding:24px;
        text-align:center;
        color:#f8fafc;
        background:#0f172a;
      ">
        <div>
          <strong>The map library could not load.</strong>
          <p style="color:#a8b3c7">
            Check your internet connection and refresh the page.
          </p>
        </div>
      </div>
    `;
  }
  throw new Error("Leaflet failed to load.");
}

// ============================================================
// EDIT ONLY THIS SECTION TO ADD / CHANGE MEMORIES
// ============================================================

const MEMORIES = [
  {
    title: "Islands of Adventure",
    date: "Agosto 2026",
    note: "Definitivamente un día que recordaré con mucho cariño por haber compartido momentos muy lindos.",
    lat: 28.4717,
    lng: -81.4734,
    type: "memory",
    image: ""
  },
  {
    title: "Cena de Primera Cita - Kingdom Sushi",
    date: "Agosto 2026",
    note: "No fue el lugar, fue con quien estaba. Al menos las risas no faltaron.",
    lat: 28.4616163,
    lng: -81.4567373,
    type: "memory",
    image: ""
  },
  {
    title: "Cine - Old Mill Playhouse",
    date: "Agosto 2026",
    note: "Vimos Spiderman Brand New Day. Me pareció muy lindo cuando lloraste por algunas escenas.",
    lat: 28.9080,
    lng: -81.9748,
    type: "memory",
    image: ""
  },
  {
    title: "Pastelitos Marilu",
    date: "Agosto 2026",
    note: "El desayuno antes de ir al parque. Estaba bueno todo, pero todavía no he entendido el chiste que quiso hacer de Juan...",
    lat: 28.8118,
    lng: -81.7305,
    type: "memory",
    image: ""
  },
  {
    title: "Heladeria - Kilwins",
    date: "Agosto 2026",
    note: "Gracias por tu recomendación del helado de ron con pasas y coco. Siempre cambiando mi vida para bien. Estaba riquísimo. Además de eso me gustó compartir ese momento contigo.",
    lat: 28.9270,
    lng: -82.0038,
    type: "memory",
    image: ""
  },
  {
    title: "Ubicación desconocida",
    date: "Algún día",
    note: "No hemos conocido este sitio aún.",
    lat: 33.749,
    lng: -84.388,
    type: "future",
    image: ""
  }
];

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

const welcome = document.getElementById("welcome");
const app = document.getElementById("app");
const enterMapBtn = document.getElementById("enterMapBtn");
const resetViewBtn = document.getElementById("resetViewBtn");
const memoriesBtn = document.getElementById("memoriesBtn");
const memoriesPanel = document.getElementById("memoriesPanel");
const closeMemoriesBtn = document.getElementById("closeMemoriesBtn");
const memoriesList = document.getElementById("memoriesList");

const memoryCard = document.getElementById("memoryCard");
const closeCardBtn = document.getElementById("closeCardBtn");
const memoryDate = document.getElementById("memoryDate");
const memoryTitle = document.getElementById("memoryTitle");
const memoryNote = document.getElementById("memoryNote");
const memoryImage = document.getElementById("memoryImage");
const memoryCount = document.getElementById("memoryCount");

let map = null;
let markers = [];
let resizeObserver = null;

function buildMemoriesMenu() {
  memoriesList.innerHTML = "";

  MEMORIES.forEach((memory, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "memory-list-item";

    const isFuture = memory.type === "future";

    button.innerHTML = `
      <span class="memory-list-title">
        <span class="memory-list-star ${isFuture ? "future" : ""}">
          ${isFuture ? "☆" : "★"}
        </span>
        ${memory.title}
      </span>

      <span class="memory-list-date">
        ${memory.date}
      </span>
    `;

    button.addEventListener("click", () => {
      memoriesPanel.classList.add("hidden");

      if (!map || !markers[index]) return;

      map.flyTo(
        [memory.lat, memory.lng],
        16,
        {
          animate: true,
          duration: 1.2
        }
      );

      setTimeout(() => {
        openMemory(memory);
      }, 700);
    });

    memoriesList.appendChild(button);
  });
}

function starIcon(type) {
  const isFuture = type === "future";

  return L.divIcon({
    className: "star-marker",
    html: `<span class="star ${isFuture ? "future" : ""}">${isFuture ? "☆" : "★"}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function openMemory(memory) {
  memoryDate.textContent = memory.date;
  memoryTitle.textContent =
    memory.type === "future" ? `☆ ${memory.title}` : `★ ${memory.title}`;
  memoryNote.textContent = memory.note;

  if (memory.image) {
    memoryImage.src = memory.image;
    memoryImage.alt = memory.title;
    memoryImage.classList.remove("hidden");
  } else {
    memoryImage.classList.add("hidden");
    memoryImage.removeAttribute("src");
  }

  memoryCard.classList.remove("hidden");
}

function fitAllMemories() {
  if (!map || markers.length === 0) return;

  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.3), {
    maxZoom: 14,
    animate: false
  });
}

function refreshMapSize() {
  if (!map) return;
  map.invalidateSize({
    pan: false,
    animate: false
  });
}

function initializeMap() {
  if (map) {
    refreshMapSize();
    fitAllMemories();
    return;
  }

  map = L.map("map", {
    zoomControl: true,
    minZoom: 3,
    preferCanvas: true
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  MEMORIES.forEach((memory) => {
    const marker = L.marker([memory.lat, memory.lng], {
      icon: starIcon(memory.type),
      title: memory.title
    }).addTo(map);

    marker.on("click", () => openMemory(memory));
    markers.push(marker);
  });

  // Keep Leaflet synchronized with the actual container size.
  const mapElement = document.getElementById("map");

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      refreshMapSize();
    });
    resizeObserver.observe(mapElement);
  }

  // Several refreshes cover browser layout/paint timing.
  requestAnimationFrame(() => {
    refreshMapSize();
    fitAllMemories();

    requestAnimationFrame(() => {
      refreshMapSize();
      fitAllMemories();
    });
  });

  setTimeout(() => {
    refreshMapSize();
    fitAllMemories();
  }, 100);

  setTimeout(() => {
    refreshMapSize();
  }, 350);
}

enterMapBtn.addEventListener("click", () => {
  welcome.classList.add("hidden");
  app.classList.remove("hidden");

  // Wait until the browser has actually laid out the visible map container.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initializeMap();
    });
  });
});

resetViewBtn.addEventListener("click", () => {
  memoryCard.classList.add("hidden");
  refreshMapSize();
  fitAllMemories();
});

closeCardBtn.addEventListener("click", () => {
  memoryCard.classList.add("hidden");
});

window.addEventListener("resize", () => {
  refreshMapSize();
});

window.addEventListener("orientationchange", () => {
  setTimeout(refreshMapSize, 150);
});

const realMemoryCount = MEMORIES.filter(
  (memory) => memory.type === "memory"
).length;

memoryCount.textContent = `Van ${realMemoryCount} memorias por el momento y contando..`;

buildMemoriesMenu();

memoriesBtn.addEventListener("click", () => {
  memoriesPanel.classList.toggle("hidden");
  memoryCard.classList.add("hidden");
});

closeMemoriesBtn.addEventListener("click", () => {
  memoriesPanel.classList.add("hidden");
});
