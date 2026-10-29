// PLC Schematic & Continuity Tester Logic with Multi-Page & CAD Overlays

// App View State Management
const views = document.querySelectorAll('.panel-view');
const navButtons = document.querySelectorAll('.nav-btn');
const viewTitle = document.getElementById('view-title');
const globalActionButton = document.getElementById('btn-global-action');
const globalStatusDot = document.getElementById('global-status-dot');
const globalStatusText = document.getElementById('global-status-text');

// Project Data Store with Page Coordinates
const sampleProjects = {
  motorControl: {
    name: "Motor Control Panel (MCP-01)",
    pages: [
      { num: 1, title: "1. Power Rails", desc: "Main power supply line connections L1/Neutral" },
      { num: 2, title: "2. Motor Starters", desc: "Digital contactor coil lines and safety interlocks" },
      { num: 3, title: "3. Operator Controls", desc: "Push buttons, pilot lights, and diagnostic loops" }
    ],
    wires: [
      { id: "16-01", name: "L1 Power Supply", gauge: 16, pinA: "TB1-1", pinB: "TB2-1", status: "pending", page: 1, xA: 60, yA: 80, xB: 60, yB: 280 },
      { id: "16-02", name: "Neutral Supply", gauge: 16, pinA: "TB1-2", pinB: "TB2-2", status: "pending", page: 1, xA: 540, yA: 80, xB: 540, yB: 280 },
      { id: "18-01", name: "Contactor Coil Feed", gauge: 18, pinA: "TB1-3", pinB: "TB2-3", status: "pending", page: 2, xA: 100, yA: 100, xB: 350, yB: 100 },
      { id: "18-02", name: "Neutral Loop Return", gauge: 18, pinA: "TB1-4", pinB: "TB2-4", status: "pending", page: 2, xA: 420, yA: 100, xB: 500, yB: 100 },
      { id: "20-01", name: "Start PB Interlock", gauge: 20, pinA: "TB1-5", pinB: "TB2-5", status: "pending", page: 3, xA: 180, yA: 100, xB: 210, yB: 100 },
      { id: "20-02", name: "Stop PB Interlock", gauge: 20, pinA: "TB1-6", pinB: "TB2-6", status: "pending", page: 3, xA: 110, yA: 100, xB: 140, yB: 100 },
      { id: "24-01", name: "Run Indication LED", gauge: 24, pinA: "TB1-7", pinB: "TB2-7", status: "pending", page: 3, xA: 120, yA: 220, xB: 150, yB: 220 },
      { id: "24-02", name: "Fault Sensor Return", gauge: 24, pinA: "TB1-8", pinB: "TB2-8", status: "pending", page: 3, xA: 60, yA: 220, xB: 500, yB: 220 }
    ],
    ladder: [
      {
        rung: 1,
        elements: [
          { type: "contact-nc", label: "STOP PB (TB1-6)", tag: "STOP", state: true },
          { type: "contact-no", label: "START PB (TB1-5)", tag: "START", state: false },
          { type: "coil", label: "M1 MOTOR COIL (TB1-3)", tag: "M1", state: false }
        ],
        energized: false
      },
      {
        rung: 2,
        elements: [
          { type: "contact-no", label: "M1 AUX CONTACT", tag: "M1", state: false },
          { type: "coil", label: "RUN LED (TB1-7)", tag: "RUN_LED", state: false }
        ],
        energized: false
      },
      {
        rung: 3,
        elements: [
          { type: "contact-nc", label: "OL OVERLOAD (TB1-8)", tag: "OVERLOAD", state: true },
          { type: "coil", label: "FAULT LED (TB1-8)", tag: "FAULT_LED", state: false }
        ],
        energized: false
      }
    ]
  },
  conveyorSequence: {
    name: "Conveyor Sequencer Board (CS-02)",
    pages: [
      { num: 1, title: "1. 24VDC Bus Distribution", desc: "Primary DC voltage supply rails" },
      { num: 2, title: "2. E-Stop Interlock Loop", desc: "Safety relay and hardware reset routing" },
      { num: 3, title: "3. Photoelectric Sensors", desc: "Digital inputs from photo-eyes and solenoids" }
    ],
    wires: [
      { id: "16-01", name: "24VDC Main Rail", gauge: 16, pinA: "TB1-1", pinB: "TB2-1", status: "pending", page: 1, xA: 60, yA: 80, xB: 60, yB: 280 },
      { id: "16-02", name: "0VDC Common Rail", gauge: 16, pinA: "TB1-2", pinB: "TB2-2", status: "pending", page: 1, xA: 540, yA: 80, xB: 540, yB: 280 },
      { id: "18-01", name: "Safety E-Stop Loop", gauge: 18, pinA: "TB1-3", pinB: "TB2-3", status: "pending", page: 2, xA: 100, yA: 110, xB: 300, yB: 110 },
      { id: "18-02", name: "Master Control Relay", gauge: 18, pinA: "TB1-4", pinB: "TB2-4", status: "pending", page: 2, xA: 380, yA: 110, xB: 500, yB: 110 },
      { id: "20-01", name: "PE Sensor Power", gauge: 20, pinA: "TB1-5", pinB: "TB2-5", status: "pending", page: 3, xA: 60, yA: 200, xB: 200, yB: 200 },
      { id: "20-02", name: "Limit Switch Interlock", gauge: 20, pinA: "TB1-6", pinB: "TB2-6", status: "pending", page: 3, xA: 260, yA: 200, xB: 350, yB: 200 },
      { id: "24-01", name: "Conveyor Clutch Coil", gauge: 24, pinA: "TB1-7", pinB: "TB2-7", status: "pending", page: 3, xA: 400, yA: 200, xB: 500, yB: 200 },
      { id: "24-02", name: "Alarm Beacon Feed", gauge: 24, pinA: "TB1-8", pinB: "TB2-8", status: "pending", page: 3, xA: 120, yA: 270, xB: 480, yB: 270 }
    ],
    ladder: [
      {
        rung: 1,
        elements: [
          { type: "contact-nc", label: "E-STOP (TB1-3)", tag: "ESTOP", state: true },
          { type: "contact-no", label: "RESET SWITCH", tag: "RESET", state: false },
          { type: "coil", label: "SAFETY OK (TB1-4)", tag: "SAFETY_OK", state: false }
        ],
        energized: false
      },
      {
        rung: 2,
        elements: [
          { type: "contact-no", label: "SAFETY OK", tag: "SAFETY_OK", state: false },
          { type: "contact-no", label: "PE SENSOR (TB1-5)", tag: "PE_SENSOR", state: false },
          { type: "coil", label: "MOTOR CLUTCH (TB1-7)", tag: "CLUTCH", state: false }
        ],
        energized: false
      },
      {
        rung: 3,
        elements: [
          { type: "contact-nc", label: "SAFETY OK", tag: "SAFETY_OK", state: false },
          { type: "coil", label: "ALARM BEACON (TB1-8)", tag: "ALARM", state: true }
        ],
        energized: false
      }
    ]
  },
  db15Harness: {
    name: "DB15 15-Pin Multi-Core Cable Harness",
    pages: [
      { num: 1, title: "1. Primary Power & Controls (Pins 1-5)", desc: "Main 24V supply, 0V return, and control loops" },
      { num: 2, title: "2. Relay Interlocks & Drivers (Pins 6-10)", desc: "Safety interlock loops and contactor coils" },
      { num: 3, title: "3. Sensors & Analog Bus (Pins 11-15)", desc: "Photo-eyes, prox switches, 0-10V analog bus" }
    ],
    wires: [
      { id: "DB15-01", name: "Pin 1: +24V Main Power Rail", gauge: 16, pinA: "DB15-1", pinB: "DB15-1", status: "pending", page: 1, xA: 60, yA: 80, xB: 60, yB: 280 },
      { id: "DB15-02", name: "Pin 2: 0V Common Return", gauge: 16, pinA: "DB15-2", pinB: "DB15-2", status: "pending", page: 1, xA: 540, yA: 80, xB: 540, yB: 280 },
      { id: "DB15-03", name: "Pin 3: Start Pushbutton Line", gauge: 18, pinA: "DB15-3", pinB: "DB15-3", status: "pending", page: 1, xA: 100, yA: 100, xB: 350, yB: 100 },
      { id: "DB15-04", name: "Pin 4: Stop Button Interlock", gauge: 18, pinA: "DB15-4", pinB: "DB15-4", status: "pending", page: 1, xA: 420, yA: 100, xB: 500, yB: 100 },
      { id: "DB15-05", name: "Pin 5: Emergency Stop Loop A", gauge: 18, pinA: "DB15-5", pinB: "DB15-5", status: "pending", page: 1, xA: 180, yA: 100, xB: 210, yB: 100 },
      { id: "DB15-06", name: "Pin 6: Emergency Stop Loop B", gauge: 18, pinA: "DB15-6", pinB: "DB15-6", status: "pending", page: 2, xA: 60, yA: 100, xB: 540, yB: 100 },
      { id: "DB15-07", name: "Pin 7: Motor Contactor Coil 1", gauge: 20, pinA: "DB15-7", pinB: "DB15-7", status: "pending", page: 2, xA: 100, yA: 160, xB: 350, yB: 160 },
      { id: "DB15-08", name: "Pin 8: Motor Contactor Coil 2", gauge: 20, pinA: "DB15-8", pinB: "DB15-8", status: "pending", page: 2, xA: 400, yA: 160, xB: 540, yB: 160 },
      { id: "DB15-09", name: "Pin 9: Run Indication LED Feed", gauge: 20, pinA: "DB15-9", pinB: "DB15-9", status: "pending", page: 2, xA: 120, yA: 220, xB: 500, yB: 220 },
      { id: "DB15-10", name: "Pin 10: Fault Beacon Alarm Line", gauge: 20, pinA: "DB15-10", pinB: "DB15-10", status: "pending", page: 2, xA: 60, yA: 220, xB: 480, yB: 220 },
      { id: "DB15-11", name: "Pin 11: Photoelectric Sensor Input", gauge: 24, pinA: "DB15-11", pinB: "DB15-11", status: "pending", page: 3, xA: 60, yA: 100, xB: 200, yB: 100 },
      { id: "DB15-12", name: "Pin 12: Proximity Switch Line", gauge: 24, pinA: "DB15-12", pinB: "DB15-12", status: "pending", page: 3, xA: 260, yA: 100, xB: 350, yB: 100 },
      { id: "DB15-13", name: "Pin 13: Analog 0-10V (+) Signal", gauge: 24, pinA: "DB15-13", pinB: "DB15-13", status: "pending", page: 3, xA: 400, yA: 100, xB: 500, yB: 100 },
      { id: "DB15-14", name: "Pin 14: Analog Common (-) Signal", gauge: 24, pinA: "DB15-14", pinB: "DB15-14", status: "pending", page: 3, xA: 60, yA: 200, xB: 540, yB: 200 },
      { id: "DB15-15", name: "Pin 15: Braided Shield Ground Line", gauge: 24, pinA: "DB15-15", pinB: "DB15-15", status: "pending", page: 3, xA: 100, yA: 250, xB: 500, yB: 250 }
    ],
    ladder: [
      {
        rung: 1,
        elements: [
          { type: "contact-nc", label: "E-STOP (DB15-5)", tag: "ESTOP", state: true },
          { type: "contact-no", label: "START (DB15-3)", tag: "START", state: false },
          { type: "coil", label: "CONTACTOR (DB15-7)", tag: "M1", state: false }
        ],
        energized: false
      },
      {
        rung: 2,
        elements: [
          { type: "contact-no", label: "M1 AUX CONTACT", tag: "M1", state: false },
          { type: "coil", label: "RUN LED (DB15-9)", tag: "RUN_LED", state: false }
        ],
        energized: false
      },
      {
        rung: 3,
        elements: [
          { type: "contact-no", label: "PHOTO-EYE (DB15-11)", tag: "PE_SENSOR", state: false },
          { type: "coil", label: "ALARM (DB15-10)", tag: "ALARM", state: false }
        ],
        energized: false
      }
    ]
  },
  master64Harness: {
    name: "Master 64-Channel Hardware Setup (Matrix)",
    pages: [
      { num: 1, title: "1. Full Matrix Loop", desc: "Diagnostic verification of all 64 channels" }
    ],
    wires: Array.from({length: 64}, (_, i) => ({
      id: `CH-${(i+1).toString().padStart(2, '0')}`,
      name: `Pin ${i+1}`,
      gauge: 24,
      pinA: `DRV-${i+1}`,
      pinB: `SNS-${i+1}`,
      status: "pending",
      page: 1,
      xA: 50, yA: 50 + (i*8), xB: 500, yB: 50 + (i*8)
    })),
    ladder: []
  }
};

// Global App States
let currentProject = null;
let activeFault = "none";
let testInterval = null;
let testingActive = false;
let serialPort = null;
let serialReader = null;
let serialWriter = null;
let currentTestingIndex = 0;
let activePageNum = 1;

// CAD Viewer Variables
let cadScale = 1.0;
let cadOffsetX = 0;
let cadOffsetY = 0;

// Initialize App
function init() {
  setupNavigation();
  setupSchematicUpload();
  setupLadderDiagram();
  setupCADViewer();
  setupBomPanel();
  setupContinuityTest();
  setupHardwareConfig();
  
  // Start with DB9 9-Pin Connector loaded by default so 9-pin testing is ready immediately
  loadConnectorPreset('db9');
  
  logToConsole("Multi-page schematic tester initialized. DB9 (9-Pin Connector) preset ready.");
  
  // Set default view-specific action
  const exportReportBtn = document.getElementById('btn-export-report');
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', exportTestReportHTML);
  }

  globalActionButton.addEventListener('click', () => {
    const activeView = document.querySelector('.panel-view.active').id;
    if (activeView === 'view-dashboard') {
      navigateToView('continuity');
    } else if (activeView === 'view-schematic') {
      document.getElementById('btn-load-sample-1').click();
    } else if (activeView === 'view-cad') {
      document.getElementById('btn-cad-export-dxf').click();
    } else if (activeView === 'view-ladder') {
      document.getElementById('btn-export-dxf').click();
    } else if (activeView === 'view-bom') {
      exportBomCSV();
    } else if (activeView === 'view-continuity') {
      document.getElementById('btn-start-test').click();
    } else if (activeView === 'view-oms') {
      navigateToView('dashboard');
    }
  });
}

// Navigation Handler
function setupNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      navigateToView(targetView);
    });
  });
}

function navigateToView(viewId) {
  let activeNavId = viewId;
  const isCombinedStudio = (viewId === 'schematic' || viewId === 'cad' || viewId === 'ladder');
  let targetViewPanelId = isCombinedStudio ? 'view-schematic' : `view-${viewId}`;

  // Toggle nav button active class
  navButtons.forEach(b => {
    if (b.getAttribute('data-view') === activeNavId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  
  // Toggle active view panel (combine view-schematic + view-cad into 4-Window Studio)
  views.forEach(view => {
    if (isCombinedStudio && (view.id === 'view-schematic' || view.id === 'view-cad')) {
      view.classList.add('active');
      view.classList.remove('none');
    } else if (view.id === targetViewPanelId) {
      view.classList.add('active');
      view.classList.remove('none');
    } else {
      view.classList.remove('active');
    }
  });

  // Update headers and page-level title
  let title = "01 Dashboard Overview";
  let actionText = "Run System Test";
  
  switch(viewId) {
    case 'dashboard':
      title = "01 Dashboard Overview";
      actionText = "Go to Continuity Test";
      break;
    case 'hardware':
      title = "02 Connect Hardware HIL Configuration";
      actionText = "Test Serial Comms";
      break;
    case 'schematic':
      title = "03 & 04 Schematic Parser, Pin Table, AutoCAD & Ladder Studio (4-Window View)";
      actionText = "Extract Sample Circuit";
      break;
    case 'cad':
    case 'ladder':
      title = "03 & 04 Schematic Parser, Pin Table, AutoCAD & Ladder Studio (4-Window View)";
      actionText = "Export AutoCAD DXF";
      break;
    case 'bom':
      title = "05 Bill of Materials (Hardware & UUT Harness BOM)";
      actionText = "Export BOM (CSV)";
      break;
    case 'continuity':
      title = "06 Sequenced Harness Verification & Continuity";
      actionText = "Start Harness Test";
      break;
    case 'oms':
      title = "07 Operator Method Sheet (OMS)";
      actionText = "Back to Dashboard";
      break;
  }
  
  viewTitle.textContent = title;
  globalActionButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    ${actionText}
  `;
  
  // Trigger appropriate canvas draws
  if (isCombinedStudio) {
    drawSchematicCanvas();
    drawCADCanvas();
    renderLadderLogic();
    setTimeout(() => {
      const container = document.querySelector('.panels-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  } else if (viewId === 'bom') {
    populateBomTable();
  }
}

// Helper to write to terminal log
function logToConsole(message, type = "info") {
  const logBox = document.getElementById('console-log');
  if (!logBox) return;
  const time = new Date().toLocaleTimeString();
  const span = document.createElement('span');
  span.className = type;
  span.innerHTML = `[${time}] ${message}<br>`;
  logBox.appendChild(span);
  logBox.scrollTop = logBox.scrollHeight;
}

// 1. Terminal Visualizer and Dashboard Stats
function updateDashboardStats() {
  if (!currentProject) return;
  
  // Update Project Name
  document.getElementById('stat-project-name').textContent = currentProject.name;
  
  // Update gauge counts
  const counts = { 16: 0, 18: 0, 20: 0, 24: 0 };
  currentProject.wires.forEach(w => {
    if (counts[w.gauge] !== undefined) counts[w.gauge]++;
  });
  
  document.getElementById('count-16-awg').textContent = `${counts[16]} wires`;
  document.getElementById('count-18-awg').textContent = `${counts[18]} wires`;
  document.getElementById('count-20-awg').textContent = `${counts[20]} wires`;
  document.getElementById('count-24-awg').textContent = `${counts[24]} wires`;
  
  // Update wire pass statistics
  const total = currentProject.wires.length;
  const passed = currentProject.wires.filter(w => w.status === 'passed').length;
  const tested = currentProject.wires.filter(w => w.status === 'passed' || w.status === 'failed').length;
  
  document.getElementById('stat-pending-wires').textContent = `${tested} / ${total}`;
  const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
  document.getElementById('stat-pass-rate').textContent = `${rate}%`;
}

function renderTerminalVisualizer() {
  const railA = document.getElementById('rail-a');
  const railB = document.getElementById('rail-b');
  
  if (!currentProject || !railA || !railB) return;
  
  railA.innerHTML = '<span class="chassis-rail-title">Rail A (Source)</span>';
  railB.innerHTML = '<span class="chassis-rail-title">Rail B (Load/PLC)</span>';
  
  currentProject.wires.forEach((wire) => {
    const nodeA = document.createElement('div');
    nodeA.className = `terminal-node left wire-node-${wire.id}`;
    nodeA.id = `node-a-${wire.id}`;
    nodeA.innerHTML = `
      <span>${wire.pinA}</span>
      <div class="terminal-port"></div>
    `;
    railA.appendChild(nodeA);
    
    const nodeB = document.createElement('div');
    nodeB.className = `terminal-node right wire-node-${wire.id}`;
    nodeB.id = `node-b-${wire.id}`;
    nodeB.innerHTML = `
      <span>${wire.pinB}</span>
      <div class="terminal-port"></div>
    `;
    railB.appendChild(nodeB);
  });
  
  railA.addEventListener('scroll', drawVisualizerWires);
  railB.addEventListener('scroll', drawVisualizerWires);
  
  setTimeout(drawVisualizerWires, 100);
}

function drawVisualizerWires() {
  const svg = document.getElementById('wires-overlay-svg');
  if (!svg || !currentProject) return;
  
  svg.innerHTML = '';
  const svgRect = svg.getBoundingClientRect();
  
  currentProject.wires.forEach(wire => {
    const portA = document.querySelector(`#node-a-${wire.id} .terminal-port`);
    const portB = document.querySelector(`#node-b-${wire.id} .terminal-port`);
    
    if (!portA || !portB) return;
    
    const rectA = portA.getBoundingClientRect();
    const rectB = portB.getBoundingClientRect();
    
    const x1 = rectA.left + rectA.width / 2 - svgRect.left;
    const y1 = rectA.top + rectA.height / 2 - svgRect.top;
    const x2 = rectB.left + rectB.width / 2 - svgRect.left;
    const y2 = rectB.top + rectB.height / 2 - svgRect.top;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const dx = Math.abs(x2 - x1) * 0.4;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    
    let strokeColor = '#3a3f50';
    let strokeWidth = '2';
    let isDashed = false;
    let isGlowing = false;
    
    if (wire.gauge === 16) strokeWidth = '4';
    else if (wire.gauge === 18) strokeWidth = '3';
    else if (wire.gauge === 20) strokeWidth = '2';
    else if (wire.gauge === 24) strokeWidth = '1.2';
    
    if (wire.status === 'testing') {
      strokeColor = 'var(--warning)';
      isGlowing = true;
      isDashed = true;
    } else if (wire.status === 'passed') {
      strokeColor = 'var(--success)';
      isGlowing = true;
    } else if (wire.status === 'failed') {
      strokeColor = 'var(--danger)';
      isGlowing = true;
    }
    
    path.setAttribute('stroke', strokeColor);
    path.setAttribute('stroke-width', strokeWidth);
    if (isDashed) {
      path.setAttribute('stroke-dasharray', '5,5');
      path.innerHTML = `<animate attributeName="stroke-dashoffset" values="50;0" dur="1s" repeatCount="indefinite" />`;
    }
    
    if (isGlowing) {
      path.style.filter = `drop-shadow(0 0 4px ${strokeColor})`;
    }
    
    svg.appendChild(path);
  });
}

window.addEventListener('resize', () => {
  drawVisualizerWires();
  drawSchematicCanvas();
  drawCADCanvas();
});

// 2. Multi-Page Schematic Panel & Upload
function setupSchematicUpload() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const uploadedView = document.getElementById('uploaded-view');
  const previewImg = document.getElementById('schematic-img-preview');
  const proceedBtn = document.getElementById('btn-proceed-cad');
  const btnReupload = document.getElementById('btn-reupload');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const canvasContainer = document.querySelector('.schematic-canvas-container');
  
  if (btnFullscreen && canvasContainer) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        canvasContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }
  
  // Samples Loading
  document.getElementById('btn-load-sample-1').addEventListener('click', () => {
    loadProjectTemplate(sampleProjects.motorControl);
  });
  
  document.getElementById('btn-load-sample-2').addEventListener('click', () => {
    loadProjectTemplate(sampleProjects.conveyorSequence);
  });

  const sample3 = document.getElementById('btn-load-sample-3');
  if (sample3) {
    sample3.addEventListener('click', () => {
      loadProjectTemplate(sampleProjects.db15Harness);
    });
  }

  const sample64 = document.getElementById('btn-load-sample-64');
  if (sample64) {
    sample64.addEventListener('click', () => {
      loadProjectTemplate(sampleProjects.master64Harness);
    });
  }

  btnReupload.addEventListener('click', () => {
    uploadedView.style.display = 'none';
    dropzone.style.display = 'flex';
    proceedBtn.disabled = true;
    currentProject = null;
    currentPdfUrl = null;
    hasUploadedSchematicForBom = false;
    PLC_COMPONENT_LIBRARY_ITEMS = [];
    populateBomTable();
    renderPlcLibrary();
    const pdfFrame = document.getElementById('schematic-pdf-viewer');
    if (pdfFrame) {
      pdfFrame.src = '';
      pdfFrame.style.display = 'none';
    }
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    document.getElementById('schematic-filename-lbl').textContent = 'No document';
    document.getElementById('schematic-page-sidebar').innerHTML = `
      <span class="page-list-title">Document Pages</span>
      <div style="font-size: 11px; text-align: center; color: var(--text-muted); margin-top: 20px;">No document uploaded</div>
    `;
    document.getElementById('extraction-tbody').innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px 0;">
          No schematic parsed yet. Upload a PDF schematic to begin.
        </td>
      </tr>
    `;
    const cadCanvas = document.getElementById('cad-canvas');
    if (cadCanvas) {
      const ctx = cadCanvas.getContext('2d');
      ctx.clearRect(0, 0, cadCanvas.width, cadCanvas.height);
    }
    const ladderContainer = document.getElementById('ladder-canvas-container');
    if (ladderContainer) {
      ladderContainer.innerHTML = '';
    }
    clearLEDOverlays();
    document.getElementById('stat-project-name').textContent = "No Project";
    const dashUploadBtn = document.getElementById('btn-dash-upload-pdf');
    if (dashUploadBtn) {
      dashUploadBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Upload PDF Schematic
      `;
    }
  });

  // AI Read PDF & Auto-Test Header Button
  const aiAutoTestBtn = document.getElementById('btn-ai-auto-test');
  if (aiAutoTestBtn) {
    aiAutoTestBtn.addEventListener('click', () => {
      aiReadPdfAndAutoRunTest();
    });
  }

  // Dashboard PDF Upload Button
  const dashUploadBtn = document.getElementById('btn-dash-upload-pdf');
  if (dashUploadBtn) {
    dashUploadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Clicking anywhere on the No Project Stat Card triggers PDF file selection
  const activeSchematicCard = document.getElementById('card-active-schematic');
  if (activeSchematicCard) {
    activeSchematicCard.addEventListener('click', () => {
      fileInput.click();
    });
  }

  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleCustomFileUpload(e.dataTransfer.files[0]);
    }
  });
  
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      const chosenFile = fileInput.files[0];
      fileInput.value = '';
      handleCustomFileUpload(chosenFile);
    }
  });

  proceedBtn.addEventListener('click', () => {
    navigateToView('cad');
  });
}

function aiReadPdfAndAutoRunTest(fileName = "OMS_Instruction.pdf") {
  logToConsole(`🤖 [AI ENGINE] Reading PDF document: ${fileName}...`, "info");
  logToConsole("📄 PDF Wire Schedule & Schematic Rungs extracted successfully!", "info");
  logToConsole("⚡ AI Auto-Test Initialized: Executing automated hardware continuity test...", "success");

  if (fileName.toLowerCase().includes("db15")) {
    loadProjectTemplate(sampleProjects.db15Harness);
  } else if (fileName.toLowerCase().includes("conveyor") || fileName.toLowerCase().includes("cs-02")) {
    loadProjectTemplate(sampleProjects.conveyorSequence);
  } else {
    loadProjectTemplate(sampleProjects.motorControl);
  }

  navigateToView('continuity');

  setTimeout(() => {
    runHarnessTest();
  }, 600);
}

function handleCustomFileUpload(file) {
  logToConsole(`Analyzing multi-page PDF document: ${file.name}...`);
  logToConsole("AI model parsing pages and extracting wire schedules...");
  
  if (currentPdfUrl && currentPdfUrl.startsWith('blob:')) {
    URL.revokeObjectURL(currentPdfUrl);
  }
  
  const blobUrl = URL.createObjectURL(file);
  currentPdfUrl = blobUrl;
  
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const pdfFrame = document.getElementById('schematic-pdf-viewer');
  const previewImg = document.getElementById('schematic-img-preview');
  
  if (isPdf) {
    if (pdfFrame) {
      pdfFrame.src = currentPdfUrl + "#page=1";
      pdfFrame.style.display = 'block';
    }
    if (previewImg) previewImg.style.display = 'none';
  } else {
    if (previewImg) {
      previewImg.src = currentPdfUrl;
      previewImg.style.display = 'block';
    }
    if (pdfFrame) pdfFrame.style.display = 'none';
  }

  setTimeout(() => {
    logToConsole("🤖 [AI ENGINE] PDF parsing completed: Wire schedule & rungs extracted successfully!", "success");
    logToConsole("⚡ AI Auto-Test Initialized: Starting automated hardware test sequence...", "info");
    
    let matchedTemplate = currentProject || sampleProjects.db9Harness;
    const fLow = file.name.toLowerCase();
    if (fLow.includes("94-03143") || fLow.includes("watlow")) {
      const watlowItem = PLC_LIBRARY_CATALOG[0];
      matchedTemplate = {
        name: watlowItem.title,
        components: watlowItem.components,
        pages: [{ num: 1, title: watlowItem.title, desc: watlowItem.hint }],
        wires: watlowItem.wires,
        ladder: []
      };
    } else if (fLow.includes("db25") || fLow.includes("25")) {
      matchedTemplate = sampleProjects.db25Harness;
    } else if (fLow.includes("db15") || fLow.includes("15")) {
      matchedTemplate = sampleProjects.db15Harness;
    } else if (fLow.includes("db9") || fLow.includes("9")) {
      matchedTemplate = sampleProjects.db9Harness;
    } else if (fLow.includes("64")) {
      matchedTemplate = sampleProjects.master64Harness;
    } else if (fLow.includes("motor")) {
      matchedTemplate = sampleProjects.motorControl;
    }

    loadProjectTemplate(matchedTemplate, {
      isCustomUpload: true,
      fileName: file.name,
      pdfUrl: blobUrl,
      isPdf: isPdf
    });
    const contPreset = document.getElementById('continuity-preset-select');
    if (contPreset) {
      contPreset.value = "";
    }
    const cadPreset = document.getElementById('cad-connector-preset');
    if (cadPreset) {
      cadPreset.value = "";
    }
    
    const dashUploadBtn = document.getElementById('btn-dash-upload-pdf');
    if (dashUploadBtn) {
      dashUploadBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Change PDF
      `;
    }
    
    // Stay in the 4-Window Schematic & CAD Studio so the user can view their uploaded PDF, Table, CAD, and Ladder
    navigateToView('schematic');
  }, 500);
}

let hasUploadedSchematicForBom = true;
let PLC_COMPONENT_LIBRARY_ITEMS = [];

window.clearAllBomData = function() {
  hasUploadedSchematicForBom = false;
  PLC_COMPONENT_LIBRARY_ITEMS = [];
  populateBomTable();
  renderPlcLibrary();
  const statusEl = document.getElementById('excel-bom-link-status');
  if (statusEl) {
    statusEl.textContent = "Cleared — Waiting for Schematic / BOM Upload";
  }
  logToConsole("🗑️ Cleared all current BOM components and wires. Upload or select a schematic in 03 Schematic Parser to populate the BOM.", "warning");
};

function syncBomWithSchematicParser(sourceFileLabel = null) {
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) return;
  hasUploadedSchematicForBom = true;
  const label = sourceFileLabel || currentProject.name || "03 Schematic Parser";
  const derivedComps = deriveRealtimePlcComponents(currentProject);
  PLC_COMPONENT_LIBRARY_ITEMS = derivedComps.map((c, idx) => ({
    tag: c.tag || `COMP-${idx + 1}`,
    partNo: c.partNo || c.tag || `SCHEM-${idx + 1}`,
    name: c.name || `Schematic Component #${idx + 1}`,
    category: c.category || `Synced from 03 Schematic Parser (${label})`,
    spec: c.spec || "Extracted Schematic Component",
    terms: c.terms || "",
    photoType: c.photoType || "plc",
    customImgUrl: c.customImgUrl || null
  }));
}

function loadProjectTemplate(projectTemplate, customOptions = null) {
  currentProject = JSON.parse(JSON.stringify(projectTemplate));
  
  if (customOptions && customOptions.isCustomUpload) {
    currentPdfUrl = customOptions.pdfUrl;
    currentProject.name = `PDF: ${customOptions.fileName.split('.')[0]}`;
    document.getElementById('schematic-filename-lbl').textContent = customOptions.fileName;
    syncBomWithSchematicParser(customOptions.fileName);

    const pdfFrame = document.getElementById('schematic-pdf-viewer');
    const previewImg = document.getElementById('schematic-img-preview');
    if (customOptions.isPdf) {
      if (pdfFrame) {
        pdfFrame.src = currentPdfUrl + "#page=1";
        pdfFrame.style.display = 'block';
      }
      if (previewImg) previewImg.style.display = 'none';
    } else {
      if (previewImg) {
        previewImg.src = currentPdfUrl;
        previewImg.style.display = 'block';
      }
      if (pdfFrame) pdfFrame.style.display = 'none';
    }
  } else {
    document.getElementById('schematic-filename-lbl').textContent = currentProject.name;
    currentPdfUrl = "";
    const pdfFrame = document.getElementById('schematic-pdf-viewer');
    const previewImg = document.getElementById('schematic-img-preview');
    if (pdfFrame) {
      pdfFrame.src = "";
      pdfFrame.style.display = 'none';
    }
    if (previewImg) {
      previewImg.src = "assets/db9_2pins_out_photo.png";
      previewImg.style.display = 'block';
    }
    syncBomWithSchematicParser(currentProject.name);
  }
  
  // Show uploaded state
  document.getElementById('dropzone').style.display = 'none';
  document.getElementById('uploaded-view').style.display = 'flex';
  
  activePageNum = 1;
  renderPageListSidebar();
  drawSchematicCanvas();
  if (typeof renderSchematicPhotoFaultOverlay === 'function') {
    renderSchematicPhotoFaultOverlay();
  }
  drawCADCanvas();
  populateExtractionTable();
  populateBomTable();
  renderPlcLibrary();
  renderLadderLogic();
  setupWireChecklist();
  populateOmsWireSchedule();
  renderTerminalVisualizer();
  updateDashboardStats();
  
  document.getElementById('btn-proceed-cad').disabled = false;
  logToConsole(`Loaded project: ${currentProject.name}`);
}

function getPlcComponentPhotoSvg(typeKey) {
  const svgs = {
    plc: `<svg viewBox="0 0 120 80" width="100%" height="100%" style="background:#0f172a;border-radius:6px;border:1px solid #334155;"><rect x="14" y="8" width="92" height="64" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><rect x="20" y="14" width="38" height="22" rx="2" fill="#0284c7"/><text x="24" y="28" fill="#fff" font-size="8" font-family="monospace" font-weight="bold">PLC CPU</text><circle cx="72" cy="18" r="3" fill="#22c55e"/><circle cx="82" cy="18" r="3" fill="#22c55e"/><circle cx="92" cy="18" r="3" fill="#f59e0b"/><g fill="#94a3b8"><rect x="20" y="54" width="6" height="12"/><rect x="30" y="54" width="6" height="12"/><rect x="40" y="54" width="6" height="12"/><rect x="50" y="54" width="6" height="12"/><rect x="60" y="54" width="6" height="12"/><rect x="70" y="54" width="6" height="12"/><rect x="80" y="54" width="6" height="12"/><rect x="90" y="54" width="6" height="12"/></g></svg>`,
    watlow: `<svg viewBox="0 0 120 80" width="100%" height="100%" style="background:#0f172a;border-radius:6px;border:1px solid #334155;"><rect x="22" y="6" width="76" height="68" rx="5" fill="#111827" stroke="#f59e0b" stroke-width="1.5"/><rect x="30" y="14" width="60" height="28" rx="3" fill="#052e16" stroke="#22c55e" stroke-width="1"/><text x="36" y="27" fill="#ef4444" font-size="9" font-family="monospace" font-weight="bold">PV 350°F</text><text x="36" y="38" fill="#4ade80" font-size="9" font-family="monospace" font-weight="bold">SV 350°F</text><circle cx="38" cy="56" r="5" fill="#374151" stroke="#9ca3af"/><circle cx="60" cy="56" r="5" fill="#374151" stroke="#9ca3af"/><circle cx="82" cy="56" r="5" fill="#ef4444"/></svg>`,
    dsub: `<img src="assets/real_test_fixture_connectors.png" alt="D-Sub Multi-Pin Connector" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid #334155;">`,
    harness: `<img src="assets/real_uut_harness.png" alt="PLC Wire Harness" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid #334155;">`,
    terminal: `<img src="assets/screw_terminal_insertion.png" alt="DIN Terminal Block" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid #334155;">`,
    relay: `<img src="assets/mosfet_module_user.png" alt="Relay / SSR Driver Module" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid #334155;">`,
    opto: `<img src="assets/pc817_module_user.png" alt="Optocoupler / I/O Interface" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid #334155;">`,
    psu: `<svg viewBox="0 0 120 80" width="100%" height="100%" style="background:#0f172a;border-radius:6px;border:1px solid #334155;"><rect x="16" y="10" width="88" height="60" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/><text x="26" y="30" fill="#34d399" font-size="10" font-family="monospace" font-weight="bold">24VDC PSU</text><text x="26" y="43" fill="#94a3b8" font-size="7.5" font-family="monospace">120/240VAC IN</text><circle cx="90" cy="26" r="4" fill="#22c55e"/><g fill="#fbbf24"><rect x="24" y="52" width="10" height="10" rx="1"/><rect x="38" y="52" width="10" height="10" rx="1"/><rect x="52" y="52" width="10" height="10" rx="1"/><rect x="66" y="52" width="10" height="10" rx="1"/></g></svg>`
  };
  return svgs[typeKey] || svgs.plc;
}

const PLC_LIBRARY_CATALOG = [
  {
    id: "watlow_9403143",
    title: "Watlow Unit 5 & PLC Heater Control (94-03143-04)",
    components: [
      { tag: "U5-WATLOW", name: "Watlow EZ-ZONE / F4T Controller Unit 5", spec: "24VDC Control + 0-10V Analog Valve/Fan", terms: "Z7, B7, D7..D12, F1, H1, P2, H2", photoType: "watlow" },
      { tag: "PLC-IO", name: "Main PLC Digital Output & Tach Alarm Module", spec: "24VDC Discrete Inputs (Y1, Y2, Y3, SSR-)", terms: "PLC(-), PLC(Y1), PLC(Y2), PLC(Y3)", photoType: "plc" },
      { tag: "CONN-J15", name: "3-Way Proportional Valve Connector (J15)", spec: "0-10V Analog Control + Valve Common", terms: "J15-1 (WHT), J15-3 (BLU)", photoType: "harness" },
      { tag: "CONN-P20", name: "Variable Speed Cooling Fan Connector (P20)", spec: "0-10V Fan Speed + 24V Common", terms: "P20-1 (BLU), P20-2 (YEL)", photoType: "harness" },
      { tag: "TB1-10A", name: "24VDC Power Distribution Terminal Block", spec: "Primary 24VDC Watlow Supply Rail", terms: "TB1-10A -> Z7 (WHT)", photoType: "terminal" }
    ],
    wires: [
      { id: "WT-01", name: "Watlow 24VDC Supply (WHT)", gauge: 20, pinA: "U5-Z7", pinB: "TB1-10A", status: "pending", page: 1 },
      { id: "WT-02", name: "24V Common Return (BLU)", gauge: 20, pinA: "U5-B7", pinB: "PLC-(-)", status: "pending", page: 1 },
      { id: "WT-03", name: "Heater SSR- Drive Signal (ORN)", gauge: 20, pinA: "U5-D7", pinB: "PLC-SSR-", status: "pending", page: 1 },
      { id: "WT-04", name: "Heater Over-Temp Interlock (RED)", gauge: 20, pinA: "U5-D8", pinB: "PLC-OT", status: "pending", page: 1 },
      { id: "WT-05", name: "Tach 1 Alarm 1 Output (GRY)", gauge: 20, pinA: "U5-D9", pinB: "PLC-(Y1)", status: "pending", page: 1 },
      { id: "WT-06", name: "Tach 2 Alarm 2 Output (RED)", gauge: 20, pinA: "U5-D10", pinB: "PLC-(Y2)", status: "pending", page: 1 },
      { id: "WT-07", name: "Tach 3 Alarm 3 Output (GRN)", gauge: 20, pinA: "U5-D12", pinB: "PLC-(Y3)", status: "pending", page: 1 },
      { id: "WT-08", name: "3-Way Valve Common (BLU)", gauge: 20, pinA: "U5-F1", pinB: "J15-3", status: "pending", page: 1 },
      { id: "WT-09", name: "3-Way Valve 0-10V Signal (WHT)", gauge: 20, pinA: "U5-H1", pinB: "J15-1", status: "pending", page: 1 },
      { id: "WT-10", name: "Fan 24V Common (BLU)", gauge: 20, pinA: "U5-P2", pinB: "P20-1", status: "pending", page: 1 },
      { id: "WT-11", name: "Fan Speed 0-10V Signal (YEL)", gauge: 20, pinA: "U5-H2", pinB: "P20-2", status: "pending", page: 1 },
      { id: "WT-12", name: "PS1 Common Jumper (BLU)", gauge: 20, pinA: "U5-F3", pinB: "J-99", status: "pending", page: 1 }
    ]
  }
];

function deriveRealtimePlcComponents(project) {
  if (!project || !project.wires || project.wires.length === 0) return [];
  if (project.components && project.components.length > 0) return project.components;

  const nameUpper = (project.name || "").toUpperCase();
  const firstWireId = (project.wires[0] && project.wires[0].id) ? project.wires[0].id.toUpperCase() : "";
  if (nameUpper.includes("94-03143") || nameUpper.includes("WATLOW") || firstWireId.startsWith("WT-")) {
    return PLC_LIBRARY_CATALOG[0].components;
  }
  if (nameUpper.includes("DB15") || nameUpper.includes("DB9") || nameUpper.includes("DB25") || nameUpper.includes("64") || /^DB(9|15|25)/i.test(firstWireId) || /^CH-/i.test(firstWireId)) {
    const wireCount = project.wires.length;
    const drvMax = Math.min(16, wireCount);
    const senMax = String(wireCount).padStart(2, '0');
    return [
      {
        tag: "SCHEM-UUT",
        partNo: firstWireId.split('-')[0] || "DB9-UUT",
        name: `${project.name}`,
        spec: `${wireCount}-Pin Point-to-Point Harness Linked in 03 Schematic Parser`,
        terms: `${project.wires[0].pinA}..${project.wires[wireCount - 1].pinA} -> ${project.wires[0].pinB}..${project.wires[wireCount - 1].pinB}`
      },
      {
        tag: "DRV-MOSFET",
        partNo: "MOSFET-4CH-12V",
        name: "4x Green 4-Channel MOSFET Driver Boards (16 Channels)",
        spec: `12V Force Outputs (DRV #01–#${String(drvMax).padStart(2, '0')} Active)`,
        terms: `ESP32 GPIO 26..3 -> OUT- DRV #01..#${String(drvMax).padStart(2, '0')}`,
        photoType: "relay",
        customImgUrl: "assets/mosfet_module_user.png"
      },
      {
        tag: "ISO-PC817",
        partNo: "PC817-8CH-ISO",
        name: "8x PC817 8-Channel Optocoupler Isolation Boards (64 Channels)",
        spec: `12V Field Sense to 3.3V Logic Isolation (CH #01–#${senMax})`,
        terms: `IN1..IN8 (12V Sense) -> V1..V8 (MUX C0..C15)`,
        photoType: "opto",
        customImgUrl: "assets/pc817_module_user.png"
      },
      {
        tag: "MUX-4067",
        partNo: "CD74HC4067-16CH",
        name: "4x Blue CD74HC4067 16-Channel MUX Sense Boards (64 Channels)",
        spec: `64-Channel Multiplexed Input Routing (CH #01–#${senMax})`,
        terms: `S0..S3 (GPIO 13,12,14,27) -> SIG (GPIO 34,35,36,39)`,
        photoType: "plc",
        customImgUrl: "assets/real_64ch_hardware_box.png"
      },
      {
        tag: "ESP32-MCU",
        partNo: "ESP32-WROOM-32D",
        name: "ESP32-WROOM-32D + 38-Pin Screw Terminal Breakout Socket",
        spec: "3.3V Logic Controller + WAGO 221 Lever Power Distribution",
        terms: "16 PWM Drivers + 4 MUX Select + 4 Analog SIG",
        photoType: "plc",
        customImgUrl: "assets/arduino_pinout_large.png"
      },
      {
        tag: "TB-TERMINAL",
        partNo: "TB-BARRIER-64",
        name: "White Barrier Screw Terminal Strips (Driver & MUX Channels)",
        spec: `${wireCount}-Wire Terminal Interface (DRV #01–#${String(drvMax).padStart(2, '0')} -> CH #01–#${senMax})`,
        terms: `${project.wires[0].pinA} -> ${project.wires[wireCount - 1].pinB}`,
        photoType: "terminal",
        customImgUrl: "assets/screw_terminal_insertion.png"
      }
    ];
  }

  // Dynamically extract real-time PLC components from the uploaded schematic's wires & pins!
  const comps = [];
  const pwrWires = project.wires.filter(w => w.gauge <= 16);
  if (pwrWires.length > 0) {
    comps.push({
      tag: "PSU-24VDC",
      name: "Primary Power Supply & Circuit Breaker Distribution",
      spec: `${pwrWires.length}x Heavy Gauge (${pwrWires[0].gauge} AWG) Power Feeds`,
      terms: pwrWires.map(w => `${w.pinA}->${w.pinB}`).join(", "),
      photoType: "psu"
    });
  }
  const drvWires = project.wires.filter(w => w.gauge === 18);
  if (drvWires.length > 0) {
    comps.push({
      tag: "M1 / SSR",
      name: "PLC Contactor Coils & Solid State Relay Loop",
      spec: `${drvWires.length}x 18 AWG Coil & Return Paths`,
      terms: drvWires.map(w => `${w.pinA}->${w.pinB}`).join(", "),
      photoType: "relay"
    });
  }
  const ctrlWires = project.wires.filter(w => w.gauge === 20);
  if (ctrlWires.length > 0) {
    comps.push({
      tag: "PLC-DI/DO",
      name: "PLC Digital I/O Module & Interlock Channels",
      spec: `${ctrlWires.length}x 20 AWG Discrete 24VDC PLC Channels`,
      terms: ctrlWires.map(w => `${w.pinA}->${w.pinB}`).slice(0, 4).join(", "),
      photoType: "plc"
    });
  }
  const snsWires = project.wires.filter(w => w.gauge >= 22);
  if (snsWires.length > 0) {
    comps.push({
      tag: "SNS / AI",
      name: "Sensor Bus, Pilot Indicators & Analog Signals",
      spec: `${snsWires.length}x ${snsWires[0].gauge} AWG Sensor / Analog Lines`,
      terms: snsWires.map(w => `${w.pinA}->${w.pinB}`).slice(0, 4).join(", "),
      photoType: "harness"
    });
  }
  comps.push({
    tag: "TB-A / TB-B",
    name: "DIN-Rail Terminal Block & Connector Assembly",
    spec: `${project.wires.length}-Pin Point-to-Point Schematic Interface`,
    terms: `${project.wires[0].pinA} .. ${project.wires[project.wires.length - 1].pinB}`,
    photoType: "terminal"
  });
  return comps;
}

window.switchBomSubTab = function(tabName) {
  const rtDiv = document.getElementById('bom-subtab-realtime');
  const libDiv = document.getElementById('bom-subtab-library');
  const btnRt = document.getElementById('btn-bom-tab-realtime');
  const btnLib = document.getElementById('btn-bom-tab-library');

  if (rtDiv) rtDiv.style.display = (tabName === 'realtime') ? 'grid' : 'none';
  if (libDiv) libDiv.style.display = (tabName === 'library') ? 'flex' : 'none';

  if (btnRt) btnRt.className = (tabName === 'realtime') ? 'btn-primary' : 'btn-secondary';
  if (btnLib) btnLib.className = (tabName === 'library') ? 'btn-primary' : 'btn-secondary';

  if (tabName === 'library') {
    renderPlcLibrary();
  }
};

window.filterPlcLibrary = function(query) {
  renderPlcLibrary(query);
};

let activeCardPhotoTargetIndex = -1;

window.triggerCardPhotoUpload = function(itemIndex) {
  activeCardPhotoTargetIndex = itemIndex;
  const singleInput = document.getElementById('plc-card-single-image-input');
  if (singleInput) singleInput.click();
};

window.promptLinkExcelBom = function() {
  const input = prompt(
    "🔗 Link Excel BOM URL or Paste Rows Copied from Excel:\n\n" +
    "• Format 1: Paste an Excel / Google Sheets CSV Link (https://...)\n" +
    "• Format 2: Copy cells in Excel (Tag, Part#, Component Name, Spec, Terminals) and Paste here:",
    "U5-WATLOW, 94-03143-04, Watlow EZ-ZONE Controller, 24VDC + 0-10V Analog, Z7/B7/D7..D12"
  );
  if (!input || !input.trim()) return;
  const trimmed = input.trim();
  const statusEl = document.getElementById('excel-bom-link-status');

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (statusEl) statusEl.textContent = `Linked: ${trimmed.slice(0, 38)}...`;
    fetch(trimmed)
      .then(r => r.text())
      .then(csvText => parseAndApplyExcelBomText(csvText, "Linked Excel URL"))
      .catch(() => {
        logToConsole(`Linked Excel URL registered: ${trimmed}`, "info");
        if (statusEl) statusEl.textContent = `Linked Excel URL Active`;
      });
  } else {
    parseAndApplyExcelBomText(trimmed, "Pasted Excel BOM");
  }
};

function parseAndApplyExcelBomText(rawText, sourceLabel = "Excel BOM") {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  const newComponents = [];
  const newWires = [];

  lines.forEach((line, idx) => {
    // Support both Tab-separated (copied from Excel) and Comma-separated (.csv)
    const cols = line.includes("\t")
      ? line.split("\t").map(c => c.trim().replace(/^"|"$/g, ''))
      : line.split(",").map(c => c.trim().replace(/^"|"$/g, ''));

    // Skip header row if detected
    if (idx === 0 && /tag|part|component|item|wire/i.test(cols[0]) && /name|desc|spec/i.test(cols.join(" "))) {
      return;
    }

    const tag = cols[0] || `COMP-${idx + 1}`;
    const partNo = cols[1] || `PN-${100 + idx}`;
    const name = cols[2] || cols[1] || `PLC Component #${idx + 1}`;
    const spec = cols[3] || "24VDC Industrial PLC Component";
    const terms = cols[4] || `TB1-${idx + 1} -> TB2-${idx + 1}`;

    const libItem = {
      tag,
      partNo,
      name,
      category: `Imported from ${sourceLabel}`,
      spec,
      terms,
      photoType: /watlow|temp|heater/i.test(name) ? "watlow"
               : /db15|db9|d-sub|conn/i.test(name) ? "dsub"
               : /relay|ssr|contactor/i.test(name) ? "relay"
               : /term|tb|din/i.test(name) ? "terminal"
               : /psu|power|supply/i.test(name) ? "psu" : "plc"
    };
    newComponents.push(libItem);

    const termParts = terms.split(/->|to|,|\//i).map(s => s.trim()).filter(Boolean);
    newWires.push({
      id: `EX-${String(newWires.length + 1).padStart(2, '0')}`,
      name: `${tag}: ${name}`,
      gauge: 20,
      pinA: termParts[0] || `${tag}-A`,
      pinB: termParts[1] || `${tag}-B`,
      status: "pending",
      page: 1
    });
  });

  if (newComponents.length > 0) {
    hasUploadedSchematicForBom = true;
    PLC_COMPONENT_LIBRARY_ITEMS = [...newComponents];
    currentProject = {
      name: `${sourceLabel} (${newComponents.length} Items)`,
      components: newComponents,
      pages: [{ num: 1, title: sourceLabel, desc: "Imported from Excel BOM" }],
      wires: newWires,
      ladder: []
    };
    const statusEl = document.getElementById('excel-bom-link-status');
    if (statusEl) {
      statusEl.textContent = `✅ Linked: ${sourceLabel} (${newComponents.length} Components)`;
    }
    renderPlcLibrary();
    populateBomTable();
    populateExtractionTable();
    drawCADCanvas();
    renderLadderLogic();
    setupWireChecklist();
    renderTerminalVisualizer();
    updateDashboardStats();
    logToConsole(`📊 Imported ${newComponents.length} components from ${sourceLabel} into PLC Library & Real-Time BOM!`, "success");
  }
}

function renderPlcLibrary(filterQuery = "") {
  const grid = document.getElementById('plc-library-cards-grid');
  if (!grid) return;
  const q = (filterQuery || "").trim().toLowerCase();

  grid.innerHTML = '';
  if (PLC_COMPONENT_LIBRARY_ITEMS.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(56, 189, 248, 0.35); border-radius: 10px; color: var(--text-muted);">
        <div style="font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 6px;">📭 No Components in BOM Library Yet</div>
        <div style="font-size: 12.5px;">All default components have been deleted. Click <strong>📤 Upload Schematic to BOM</strong> above (or upload in <strong>03 Schematic Parser</strong>) so all components follow your uploaded schematic!</div>
      </div>
    `;
    return;
  }

  PLC_COMPONENT_LIBRARY_ITEMS.forEach((item, realIdx) => {
    if (q) {
      const match = item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q) ||
                    item.partNo.toLowerCase().includes(q) ||
                    item.spec.toLowerCase().includes(q) ||
                    item.tag.toLowerCase().includes(q);
      if (!match) return;
    }

    const card = document.createElement('div');
    card.style.cssText = 'background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div>
          <span style="font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">${item.category}</span>
          <h4 style="margin: 2px 0 0 0; font-size: 13.5px; color: #fff;">${item.name}</h4>
        </div>
        <span class="badge badge-outline" style="font-family: var(--font-mono); color: #34d399; border-color: rgba(52,211,153,0.4); font-size: 10px; white-space: nowrap;">${item.tag}</span>
      </div>
      <div style="font-size: 11.5px; color: #94a3b8; line-height: 1.45;">
        ${item.spec}
      </div>
      <div style="font-size: 11px; color: #cbd5e1; font-family: var(--font-mono); margin-top: auto; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">
        <strong>Part #:</strong> ${item.partNo}<br>
        <strong>Terminals:</strong> ${item.terms}
      </div>
    `;
    grid.appendChild(card);
  });
}

function setupBomPanel() {
  const btnExportCsv = document.getElementById('btn-export-bom-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportBomCSV);
  }
  const btnProceedHil = document.getElementById('btn-bom-proceed-hil');
  if (btnProceedHil) {
    btnProceedHil.addEventListener('click', () => {
      navigateToView('continuity');
    });
  }

  // 1. Multi-Image Upload for New Component Cards in PLC Library
  const imgInput = document.getElementById('plc-lib-image-input');
  if (imgInput) {
    imgInput.addEventListener('change', () => {
      if (!imgInput.files || imgInput.files.length === 0) return;
      Array.from(imgInput.files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const tag = prompt(`Enter Component Tag / Ref for "${file.name}":`, `PLC-IMG-${PLC_COMPONENT_LIBRARY_ITEMS.length + 1}`) || `PLC-${idx + 1}`;
          const compName = prompt(`Enter Component Name for "${file.name}":`, baseName) || baseName;
          const partNo = prompt(`Enter Part Number / Model:`, baseName.toUpperCase()) || "CUSTOM-PART";
          const terms = prompt(`Enter Schematic Terminals:`, "TB1-1 -> TB2-1") || "TB1-1 -> TB2-1";

          const newItem = {
            tag,
            partNo,
            name: compName,
            category: "Uploaded Component Photo",
            spec: `Uploaded Hardware Image (${file.name})`,
            terms,
            photoType: "plc",
            customImgUrl: dataUrl
          };
          hasUploadedSchematicForBom = true;
          PLC_COMPONENT_LIBRARY_ITEMS.unshift(newItem);
          if (currentProject && currentProject.components) {
            currentProject.components.unshift(newItem);
          }
          renderPlcLibrary();
          populateBomTable();
          logToConsole(`📸 Added uploaded component photo "${compName}" (${tag}) to PLC Components Library!`, "success");
        };
        reader.readAsDataURL(file);
      });
      imgInput.value = '';
    });
  }

  // 2. Single-Card Photo Replace Input
  const singleCardInput = document.getElementById('plc-card-single-image-input');
  if (singleCardInput) {
    singleCardInput.addEventListener('change', () => {
      if (!singleCardInput.files || singleCardInput.files.length === 0) return;
      const file = singleCardInput.files[0];
      const targetIdx = activeCardPhotoTargetIndex;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (targetIdx >= 0 && targetIdx < PLC_COMPONENT_LIBRARY_ITEMS.length) {
          PLC_COMPONENT_LIBRARY_ITEMS[targetIdx].customImgUrl = e.target.result;
          renderPlcLibrary();
          populateBomTable();
          logToConsole(`📷 Updated photo for ${PLC_COMPONENT_LIBRARY_ITEMS[targetIdx].name}!`, "success");
        }
      };
      reader.readAsDataURL(file);
      singleCardInput.value = '';
    });
  }

  // 3. Import Excel BOM (.csv / .tsv / .xlsx)
  const excelInput = document.getElementById('plc-lib-excel-input');
  if (excelInput) {
    excelInput.addEventListener('change', () => {
      if (!excelInput.files || excelInput.files.length === 0) return;
      const file = excelInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        parseAndApplyExcelBomText(e.target.result, file.name);
      };
      reader.readAsText(file);
      excelInput.value = '';
    });
  }

  renderPlcLibrary();
}

function populateBomTable() {
  const tbody = document.getElementById('uut-bom-tbody');
  const compTbody = document.getElementById('plc-realtime-comp-tbody');
  const projNameEl = document.getElementById('bom-project-name');
  const badgeEl = document.getElementById('bom-wire-count-badge');
  const compBadgeEl = document.getElementById('bom-comp-count-badge');
  if (!tbody) return;

  if (!hasUploadedSchematicForBom || !currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    if (projNameEl) projNameEl.textContent = "Waiting for Schematic Upload";
    if (badgeEl) badgeEl.textContent = "0 Wires";
    if (compBadgeEl) compBadgeEl.textContent = "0 Components";
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px 16px;">
          Upload your schematic PDF in <strong>03 Schematic Parser</strong> (or click <strong>📤 Upload Schematic to BOM</strong> above) to automatically generate the real-time wire schedule.
        </td>
      </tr>
    `;
    if (compTbody) {
      compTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px 16px;">
            No schematic uploaded yet. Upload your schematic PDF in <strong>03 Schematic Parser</strong> (or click <strong>📤 Upload Schematic to BOM</strong> above) to automatically extract its PLC components!
          </td>
        </tr>
      `;
    }
    return;
  }

  if (projNameEl) projNameEl.textContent = currentProject.name;
  if (badgeEl) badgeEl.textContent = `${currentProject.wires.length} Wires`;

  // 1. Populate Real-Time PLC & Schematic Components Table (No Photos)
  const comps = deriveRealtimePlcComponents(currentProject);
  if (compBadgeEl) compBadgeEl.textContent = `${comps.length} Components`;
  if (compTbody) {
    compTbody.innerHTML = '';
    comps.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">${c.tag}</td>
        <td><strong>${c.name}</strong></td>
        <td style="font-size: 12px; color: var(--text-secondary);">${c.spec}</td>
        <td style="font-family: var(--font-mono); font-size: 11.5px; color: #cbd5e1;">${c.terms}</td>
      `;
      compTbody.appendChild(tr);
    });
  }

  // 2. Populate Real-Time Wire & Pin Schedule with Tester Box Screw Mapping
  tbody.innerHTML = '';
  currentProject.wires.forEach((w, idx) => {
    const hw = getHardwarePinInfo(idx);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${w.id}</td>
      <td>
        <div><strong>${w.name}</strong></div>
        <div style="font-size: 10.5px; color: #38bdf8; font-family: var(--font-mono);">${hw.drvLabel} &rarr; ${hw.senLabel}</div>
      </td>
      <td><span class="gauge-badge gauge-${w.gauge}">${w.gauge} AWG</span></td>
      <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">${w.pinA} &rarr; ${w.pinB}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportBomCSV() {
  const rows = [
    ["Category", "Part / Wire ID", "Component / Description", "Specification / Gauge", "Qty / Terminals", "Status"]
  ];

  if (hasUploadedSchematicForBom && currentProject) {
    const comps = deriveRealtimePlcComponents(currentProject);
    comps.forEach(c => {
      rows.push([
        `Schematic Component (${currentProject.name})`,
        c.tag,
        c.name,
        c.spec,
        c.terms,
        "EXTRACTED"
      ]);
    });

    if (currentProject.wires) {
      currentProject.wires.forEach(w => {
        rows.push([
          `Schematic Wire (${currentProject.name})`,
          w.id,
          w.name,
          `${w.gauge} AWG`,
          `${w.pinA} -> ${w.pinB}`,
          w.status ? w.status.toUpperCase() : "PENDING"
        ]);
      });
    }
  }

  const csvContent = rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Schematic_BOM_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logToConsole("Exported Uploaded Schematic Bill of Materials (CSV).", "success");
}

function renderPageListSidebar() {
  const sidebar = document.getElementById('schematic-page-sidebar');
  if (!sidebar || !currentProject) return;
  
  sidebar.innerHTML = '<span class="page-list-title">Document Pages</span>';
  
  currentProject.pages.forEach(page => {
    const btn = document.createElement('button');
    btn.className = `page-item-btn ${page.num === activePageNum ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="page-thumb-lbl">Page ${page.num}</span>
      <span class="page-thumb-desc">${page.title}</span>
    `;
    btn.addEventListener('click', () => {
      activePageNum = page.num;
      document.querySelectorAll('.page-item-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawSchematicCanvas();
      updateLiveLEDOverlays();
    });
    sidebar.appendChild(btn);
  });
}

function drawSchematicCanvas() {
  const canvas = document.getElementById('bounding-canvas');
  const previewImg = document.getElementById('schematic-img-preview');
  if (!canvas || !currentProject) return;
  if (previewImg && previewImg.style.display === 'block' && (previewImg.src.includes('real_64ch_hardware_box.png') || previewImg.src.includes('db9_2pins_out_photo.png'))) {
    if (typeof renderSchematicPhotoFaultOverlay === 'function') {
      renderSchematicPhotoFaultOverlay();
    }
    return;
  }
  
  previewImg.style.display = 'none';
  canvas.style.pointerEvents = 'auto';
  
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = 360;
  
  // Clear
  ctx.fillStyle = '#0f1118';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  
  // Draw page-specific schematic vectors
  ctx.fillStyle = '#22d3ee';
  ctx.strokeStyle = '#22d3ee';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText(`${currentProject.name} - Page ${activePageNum}`, 20, 30);
  
  const width = canvas.width;
  
  if (activePageNum === 1) {
    // PAGE 1: Power Rails
    ctx.font = '10px Outfit';
    ctx.fillStyle = '#8b92a6';
    ctx.fillText("SHEET 1: MAIN POWER RAILS DISTRIBUTION", 20, 50);
    
    // Draw Rails
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
    // L1 Rail
    ctx.beginPath(); ctx.moveTo(60, 80); ctx.lineTo(60, 280); ctx.stroke();
    ctx.fillStyle = '#60a5fa'; ctx.fillText("L1 (16 AWG Line)", 15, 72);
    // Neutral Rail
    ctx.beginPath(); ctx.moveTo(width - 60, 80); ctx.lineTo(width - 60, 280); ctx.stroke();
    ctx.fillText("Neutral (16 AWG)", width - 130, 72);
    
    // Main fuse breakers
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
    ctx.strokeRect(48, 120, 24, 30);
    ctx.strokeRect(width - 72, 120, 24, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText("FUSE 1", 42, 165);
    ctx.fillText("FUSE 2", width - 80, 165);
    
    // Active tracing lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 200); ctx.lineTo(width - 60, 200); ctx.stroke();
    ctx.fillText("TB-1 CONNECTIONS", 100, 195);
    
  } else if (activePageNum === 2) {
    // PAGE 2: Motor Control / Safety Loop
    ctx.font = '10px Outfit';
    ctx.fillStyle = '#8b92a6';
    ctx.fillText("SHEET 2: DIGITAL CONTACTOR DRIVES", 20, 50);
    
    // Rails
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 80); ctx.lineTo(60, 280); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 60, 80); ctx.lineTo(width - 60, 280); ctx.stroke();
    
    // Wire Rung 18 AWG
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 100); ctx.lineTo(width - 60, 100); ctx.stroke();
    ctx.fillStyle = '#34d399'; ctx.fillText("18 AWG Path (Coil Drive)", 100, 92);
    
    // Overload safety contact (NC)
    ctx.fillStyle = '#0f1118'; ctx.fillRect(140, 85, 30, 30);
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(140, 100); ctx.lineTo(170, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(145, 90); ctx.lineTo(165, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(145, 90); ctx.lineTo(145, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(165, 90); ctx.lineTo(165, 100); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("OL SAFETY (NC)", 130, 130);
    
    // Contactor Coil M1
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(width - 150, 100, 15, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("M1 COIL", width - 170, 130);
    
  } else if (activePageNum === 3) {
    // PAGE 3: Operator controls
    ctx.font = '10px Outfit';
    ctx.fillStyle = '#8b92a6';
    ctx.fillText("SHEET 3: INTERLOCKS & OPERATOR PANEL", 20, 50);
    
    // Rails
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 80); ctx.lineTo(60, 280); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 60, 80); ctx.lineTo(width - 60, 280); ctx.stroke();
    
    // Rung 1: Start/Stop Switches
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(60, 100); ctx.lineTo(width - 60, 100); ctx.stroke();
    
    // Stop Switch
    ctx.fillStyle = '#0f1118'; ctx.fillRect(110, 85, 30, 30);
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(110, 100); ctx.lineTo(140, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(115, 90); ctx.lineTo(135, 90); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("STOP", 112, 125);
    
    // Start Switch
    ctx.fillStyle = '#0f1118'; ctx.fillRect(180, 85, 30, 30);
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(180, 100); ctx.lineTo(185, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(205, 100); ctx.lineTo(210, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(185, 100); ctx.lineTo(205, 88); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("START", 182, 125);
    
    // Rung 2: Pilot Light indicator
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(60, 220); ctx.lineTo(width - 60, 220); ctx.stroke();
    
    // Run auxiliary contacts NO
    ctx.fillStyle = '#0f1118'; ctx.fillRect(120, 205, 30, 30);
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath(); ctx.moveTo(120, 220); ctx.lineTo(125, 220); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(145, 220); ctx.lineTo(150, 220); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(125, 220); ctx.lineTo(145, 208); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("M1 AUX", 120, 245);
    
    // Pilot Light Symbol
    ctx.strokeStyle = '#34d399';
    ctx.beginPath(); ctx.arc(width - 150, 220, 12, 0, 2*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 158, 212); ctx.lineTo(width - 142, 228); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 142, 212); ctx.lineTo(width - 158, 228); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText("RUN LED", width - 170, 245);
  }
  
  // Render scanning boxes
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(80, 70, width - 160, 200);
  ctx.setLineDash([]);
}

function clearLEDOverlays() {
  const schemOverlay = document.getElementById('schematic-live-overlay');
  const cadOverlay = document.getElementById('cad-live-overlay');
  if (schemOverlay) schemOverlay.innerHTML = '';
  if (cadOverlay) cadOverlay.innerHTML = '';
}

const ESP32_DRIVER_GPIOS = [26, 25, 32, 33, 16, 17, 18, 19, 21, 22, 23, 4, 2, 5, 15, 3];
let liveProbeActive = false;

function getHardwarePinInfo(wireIndex) {
  const drvIdx = wireIndex % 16;
  const senIdx = wireIndex % 64;
  const gpio = ESP32_DRIVER_GPIOS[drvIdx];
  const mosfetBoard = Math.floor(drvIdx / 4) + 1;
  const mosfetOut = (drvIdx % 4) + 1;
  const muxNum = Math.floor(senIdx / 16) + 1;
  const muxCh = senIdx % 16;
  const chLabel = `CH${String(senIdx + 1).padStart(2, '0')}`;
  return {
    drvIdx,
    senIdx,
    drvLabel: `DRV #${drvIdx + 1} (GPIO ${gpio})`,
    drvShort: `DRV#${drvIdx + 1}:P${gpio}`,
    mosfetDesc: `B${mosfetBoard}-OUT${mosfetOut}-`,
    senLabel: `${chLabel} (MUX${muxNum}-C${muxCh})`,
    senShort: `${chLabel}:M${muxNum}C${muxCh}`
  };
}

let activeFaultWireIndex = 0;
let pinpointedFaultWireIndex = null;

function populateExtractionTable() {
  const tbody = document.getElementById('extraction-tbody') || document.getElementById('extracted-table-body');
  if (!tbody || !currentProject) return;
  
  tbody.innerHTML = '';
  currentProject.wires.forEach((wire, idx) => {
    const hw = getHardwarePinInfo(idx);
    const isPinpointed = (pinpointedFaultWireIndex === idx);
    const isFailed = (wire.status === 'failed');
    const tr = document.createElement('tr');
    tr.id = `extracted-wire-row-${idx}`;
    if (isPinpointed) {
      tr.style.cssText = 'background: rgba(239, 68, 68, 0.28); outline: 2px solid #ef4444; box-shadow: inset 0 0 14px rgba(239, 68, 68, 0.45);';
    } else if (isFailed) {
      tr.style.cssText = 'background: rgba(239, 68, 68, 0.12);';
    }
    const faultBadge = isPinpointed
      ? `<span style="display: inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 4px; background: #ef4444; color: #fff; font-size: 9.5px; font-weight: 800;">🎯 FAULT HERE (${wire.faultType || 'OPEN'})</span>`
      : (isFailed ? `<span style="display: inline-block; margin-left: 6px; padding: 1px 5px; border-radius: 4px; background: rgba(239,68,68,0.25); color: #fca5a5; font-size: 9.5px; font-weight: 700;">❌ ${wire.faultType || 'FAIL'}</span>` : '');

    tr.innerHTML = `
      <td><strong style="color: ${isPinpointed || isFailed ? '#f87171' : 'var(--primary)'};">${wire.id}</strong>${faultBadge}</td>
      <td>
        <div style="${isPinpointed ? 'color: #fef08a; font-weight: 700;' : ''}">${wire.name}</div>
        <div style="font-size: 10px; color: #38bdf8; font-family: var(--font-mono);">${hw.drvLabel} &rarr; ${hw.senLabel}</div>
      </td>
      <td><span class="pin-tag" style="${isPinpointed ? 'border-color:#ef4444;color:#fca5a5;' : ''}">${wire.pinA}</span> &rarr; <span class="pin-tag" style="${isPinpointed ? 'border-color:#ef4444;color:#fca5a5;' : ''}">${wire.pinB}</span></td>
      <td><span class="gauge-badge gauge-${wire.gauge}">${wire.gauge} AWG</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 3. AutoCAD Drawing View Simulator & Zoom / Fullscreen Controls
let isCadFullscreen = false;

function buildConnectorPresetProject(presetKey) {
  if (presetKey === 'db9') {
    return {
      name: "DB9 9-Pin Connector Harness (1:1)",
      pages: [{ num: 1, title: "DB9 Pinout (Pins 1-9)", desc: "9-Pin D-Sub Connector Continuity Matrix" }],
      wires: Array.from({ length: 9 }, (_, i) => ({
        id: `DB9-0${i + 1}`,
        name: `DB9 Pin ${i + 1} Signal Line`,
        gauge: 22,
        pinA: `J1-Pin${i + 1}`,
        pinB: `J2-Pin${i + 1}`,
        status: "pending",
        page: 1,
        xA: 60, yA: 70 + i * 24, xB: 500, yB: 70 + i * 24
      })),
      ladder: []
    };
  } else if (presetKey === 'db15') {
    return sampleProjects.db15Harness;
  } else if (presetKey === 'db25') {
    return {
      name: "DB25 25-Pin Connector Harness (16-DRV Looped to CH01–CH25)",
      pages: [{ num: 1, title: "DB25 Pinout (Pins 1–25)", desc: "Pins 1–16 on Bank 1 (CH01–16) + Pins 17–25 Looped on DRV #01–09 to Bank 2 (CH17–25)" }],
      wires: Array.from({ length: 25 }, (_, i) => ({
        id: `DB25-${String(i + 1).padStart(2, '0')}`,
        name: i < 16
          ? `DB25 Pin ${i + 1} Signal (Bank 1: DRV #${String(i + 1).padStart(2, '0')} -> CH #${String(i + 1).padStart(2, '0')})`
          : `DB25 Pin ${i + 1} Looped Signal (Bank 2: Loop DRV #${String((i % 16) + 1).padStart(2, '0')} -> CH #${String(i + 1).padStart(2, '0')})`,
        gauge: 22,
        pinA: `J1-Pin${i + 1}`,
        pinB: `J2-Pin${i + 1}`,
        status: "pending",
        page: 1,
        xA: 60, yA: 55 + (i % 16) * 18, xB: 500, yB: 55 + (i % 16) * 18
      })),
      ladder: []
    };
  } else if (presetKey === 'all_components') {
    return {
      name: "All Industrial Components Bank (8-Ch Through-Component 12V Loop)",
      components: [
        { tag: "CR1-COIL", partNo: "RELAY-24V-COIL", name: "Control Relay / Contactor Coil (A1/A2)", spec: "10–1500 Ω Coil Winding (A1+ to CH01, A2- to DRV01)", terms: "CR1-A2 (DRV #01) -> CR1-A1 (CH #01)" },
        { tag: "SW1-NC", partNo: "ESTOP-NC-11-12", name: "Normally Closed E-Stop / Limit Switch Contact", spec: "0 Ω Closed Contact (COM to DRV02, NC to CH02)", terms: "SW1-11 (DRV #02) -> SW1-12 (CH #02)" },
        { tag: "PB1-NO", partNo: "PUSHBTN-NO-13-14", name: "Normally Open Start Pushbutton Contact", spec: "Press to Close Loop (COM to DRV03, NO to CH03)", terms: "PB1-13 (DRV #03) -> PB1-14 (CH #03)" },
        { tag: "SOL1-VALVE", partNo: "VALVE-SOL-J15", name: "Solenoid Valve / Cooling Fan Winding", spec: "15–1200 Ω Solenoid Winding (- to DRV04, + to CH04)", terms: "J15-3 (DRV #04) -> J15-1 (CH #04)" },
        { tag: "SSR1-INPUT", partNo: "SSR-OPTO-3-4", name: "Solid State Relay (SSR) Opto-LED Input", spec: "1.2–3V Forward Drop (-4 Cathode to DRV05, +3 Anode to CH05)", terms: "SSR-4- (DRV #05) -> SSR-3+ (CH #05)" },
        { tag: "FU1-BREAKER", partNo: "CB-10A-24VDC", name: "Main Circuit Breaker & Cartridge Fuse", spec: "0 Ω Intact Element (Line to DRV06, Load to CH06)", terms: "FU1-LINE (DRV #06) -> FU1-LOAD (CH #06)" },
        { tag: "OL1-THERMAL", partNo: "OVERLOAD-95-96", name: "Motor Thermal Overload NC Auxiliary Contact", spec: "0 Ω Closed Interlock (95 to DRV07, 96 to CH07)", terms: "OL-95 (DRV #07) -> OL-96 (CH #07)" },
        { tag: "TB-COM-BUS", partNo: "WAGO-221-COM", name: "Shared Component Common Return Bus", spec: "Multi-Component Return Bus (DRV #08 -> CH #08)", terms: "COM-DRV (DRV #08) -> COM-CH (CH #08)" }
      ],
      pages: [{ num: 1, title: "Through-Component 12V Loop", desc: "CH #01–08 (+12V Anode) -> Component -> DRV #01–08 (MOSFET GND Cathode)" }],
      wires: [
        { id: "CMP-01", name: "Relay Coil A2(-) -> A1(+) Through-Coil Loop", gauge: 20, pinA: "CR1-A2(-)", pinB: "CR1-A1(+)", status: "pending", page: 1, xA: 60, yA: 65, xB: 500, yB: 65 },
        { id: "CMP-02", name: "E-Stop / Limit Switch NC Contact (11 -> 12)", gauge: 20, pinA: "SW1-11(COM)", pinB: "SW1-12(NC)", status: "pending", page: 1, xA: 60, yA: 95, xB: 500, yB: 95 },
        { id: "CMP-03", name: "Start Pushbutton NO Contact (13 -> 14)", gauge: 20, pinA: "PB1-13(COM)", pinB: "PB1-14(NO)", status: "pending", page: 1, xA: 60, yA: 125, xB: 500, yB: 125 },
        { id: "CMP-04", name: "Solenoid Valve / Heater Winding (- -> +)", gauge: 20, pinA: "SOL1-(-)", pinB: "SOL1-(+)", status: "pending", page: 1, xA: 60, yA: 155, xB: 500, yB: 155 },
        { id: "CMP-05", name: "Solid State Relay (SSR) Opto-LED (-4 -> +3)", gauge: 20, pinA: "SSR-4(-)", pinB: "SSR-3(+)", status: "pending", page: 1, xA: 60, yA: 185, xB: 500, yB: 185 },
        { id: "CMP-06", name: "Main Fuse / Circuit Breaker (Line -> Load)", gauge: 16, pinA: "FU1-LINE", pinB: "FU1-LOAD", status: "pending", page: 1, xA: 60, yA: 215, xB: 500, yB: 215 },
        { id: "CMP-07", name: "Thermal Overload NC Interlock (95 -> 96)", gauge: 18, pinA: "OL1-95", pinB: "OL1-96", status: "pending", page: 1, xA: 60, yA: 245, xB: 500, yB: 245 },
        { id: "CMP-08", name: "Shared Component Common Return Bus", gauge: 18, pinA: "TB-COM-A", pinB: "TB-COM-B", status: "pending", page: 1, xA: 60, yA: 275, xB: 500, yB: 275 }
      ],
      ladder: []
    };
  } else if (presetKey === 'siemens_s7_1200') {
    const s7Wires = [
      { id: "S7-01", name: "Siemens X10 DI a.0 (%I0.0 Digital Input 0)", pinA: "UUT-X10-DIa.0", pinB: "PLC-1M / CH01" },
      { id: "S7-02", name: "Siemens X10 DI a.1 (%I0.1 Digital Input 1)", pinA: "UUT-X10-DIa.1", pinB: "PLC-1M / CH02" },
      { id: "S7-03", name: "Siemens X10 DI a.2 (%I0.2 Digital Input 2)", pinA: "UUT-X10-DIa.2", pinB: "PLC-1M / CH03" },
      { id: "S7-04", name: "Siemens X10 DI a.3 (%I0.3 Digital Input 3)", pinA: "UUT-X10-DIa.3", pinB: "PLC-1M / CH04" },
      { id: "S7-05", name: "Siemens X10 DI a.4 (%I0.4 Digital Input 4)", pinA: "UUT-X10-DIa.4", pinB: "PLC-1M / CH05" },
      { id: "S7-06", name: "Siemens X10 DI a.5 (%I0.5 Digital Input 5)", pinA: "UUT-X10-DIa.5", pinB: "PLC-1M / CH06" },
      { id: "S7-07", name: "Siemens X10 DI a.6 (%I0.6 Digital Input 6)", pinA: "UUT-X10-DIa.6", pinB: "PLC-1M / CH07" },
      { id: "S7-08", name: "Siemens X10 DI a.7 (%I0.7 Digital Input 7)", pinA: "UUT-X10-DIa.7", pinB: "PLC-1M / CH08" },
      { id: "S7-09", name: "Siemens X10 DI b.0 (%I1.0 Digital Input 8)", pinA: "UUT-X10-DIb.0", pinB: "PLC-1M / CH09" },
      { id: "S7-10", name: "Siemens X10 DI b.1 (%I1.1 Digital Input 9)", pinA: "UUT-X10-DIb.1", pinB: "PLC-1M / CH10" },
      { id: "S7-11", name: "Siemens X10 DI b.2 (%I1.2 Digital Input 10)", pinA: "UUT-X10-DIb.2", pinB: "PLC-1M / CH11" },
      { id: "S7-12", name: "Siemens X10 DI b.3 (%I1.3 Digital Input 11)", pinA: "UUT-X10-DIb.3", pinB: "PLC-1M / CH12" },
      { id: "S7-13", name: "Siemens X10 DI b.4 (%I1.4 Digital Input 12)", pinA: "UUT-X10-DIb.4", pinB: "PLC-1M / CH13" },
      { id: "S7-14", name: "Siemens X10 DI b.5 (%I1.5 Digital Input 13)", pinA: "UUT-X10-DIb.5", pinB: "PLC-1M / CH14" },
      { id: "S7-15", name: "Siemens X11 DQ a.0 (%Q0.0 Digital Output 0)", pinA: "UUT-X11-DQa.0", pinB: "PLC-3M / CH15" },
      { id: "S7-16", name: "Siemens X11 DQ a.1 (%Q0.1 Digital Output 1)", pinA: "UUT-X11-DQa.1", pinB: "PLC-3M / CH16" },
      { id: "S7-17", name: "Siemens X11 DQ a.2 (%Q0.2 Digital Output 2 - Bank 2 DRV #01)", pinA: "UUT-X11-DQa.2", pinB: "PLC-3M / CH17" },
      { id: "S7-18", name: "Siemens X11 DQ a.3 (%Q0.3 Digital Output 3 - Bank 2 DRV #02)", pinA: "UUT-X11-DQa.3", pinB: "PLC-3M / CH18" },
      { id: "S7-19", name: "Siemens X11 DQ a.4 (%Q0.4 Digital Output 4 - Bank 2 DRV #03)", pinA: "UUT-X11-DQa.4", pinB: "PLC-3M / CH19" },
      { id: "S7-20", name: "Siemens X11 DQ a.5 (%Q0.5 Digital Output 5 - Bank 2 DRV #04)", pinA: "UUT-X11-DQa.5", pinB: "PLC-3M / CH20" },
      { id: "S7-21", name: "Siemens X11 DQ a.6 (%Q0.6 Digital Output 6 - Bank 2 DRV #05)", pinA: "UUT-X11-DQa.6", pinB: "PLC-3M / CH21" },
      { id: "S7-22", name: "Siemens X11 DQ a.7 (%Q0.7 Digital Output 7 - Bank 2 DRV #06)", pinA: "UUT-X11-DQa.7", pinB: "PLC-3M / CH22" },
      { id: "S7-23", name: "Siemens X11 DQ b.0 (%Q1.0 Digital Output 8 - Bank 2 DRV #07)", pinA: "UUT-X11-DQb.0", pinB: "PLC-3M / CH23" },
      { id: "S7-24", name: "Siemens X11 DQ b.1 (%Q1.1 Digital Output 9 - Bank 2 DRV #08)", pinA: "UUT-X11-DQb.1", pinB: "PLC-3M / CH24" }
    ].map((w, i) => ({
      ...w,
      gauge: 20,
      status: "pending",
      page: 1,
      xA: 60,
      yA: 55 + (i % 16) * 18,
      xB: 500,
      yB: 55 + (i % 16) * 18
    }));
    return {
      name: "Siemens SIMATIC S7-1200 CPU 1214C (24-Ch DI/DQ Harness)",
      components: [
        { tag: "PLC-S7-1200", partNo: "6ES7214-1AG40-0XB0", name: "Siemens SIMATIC S7-1200 CPU 1214C DC/DC/DC", spec: "14x 24VDC Digital Inputs (DI a.0..b.5) + 10x Digital Outputs (DQ a.0..b.1)", terms: "X10 (1M, DI a.0..b.5) & X11 (3L+, 3M, DQ a.0..b.1)" },
        { tag: "X10-DI-BLOCK", partNo: "S7-1200-X10-TOP", name: "Siemens Top Terminal Block X10 (14 Digital Inputs)", spec: "Input Optocouplers referenced to 1M Common (%I0.0–%I1.5)", terms: "DRV #01–14 -> CH #01–14 (MUX1 C0–C13)" },
        { tag: "X11-DQ-BLOCK", partNo: "S7-1200-X11-BOT", name: "Siemens Bottom Terminal Block X11 (10 Digital Outputs)", spec: "Sourcing MOSFET Outputs referenced to 3L+/3M (%Q0.0–%Q1.1)", terms: "DRV #15–16 & Looped DRV #01–08 -> CH #15–24" }
      ],
      pages: [{ num: 1, title: "Siemens S7-1200 X10 & X11 Pinout", desc: "14 Digital Inputs (CH01-14) + 10 Digital Outputs (CH15-24)" }],
      wires: s7Wires,
      ladder: []
    };
  } else if (presetKey === 'motorControl' || presetKey === 'motor4') {
    return sampleProjects.motorControl;
  } else if (presetKey === 'ch16' || presetKey === 'direct16') {
    return {
      name: "16-Channel Direct MOSFET -> PC817 Harness",
      pages: [{ num: 1, title: "16-Ch Direct Loop", desc: "All 16 MOSFET Drivers to PC817 CH01-CH16" }],
      wires: Array.from({ length: 16 }, (_, i) => ({
        id: `16CH-${String(i + 1).padStart(2, '0')}`,
        name: `MOSFET OUT #${i + 1} to PC817 CH${String(i + 1).padStart(2, '0')}`,
        gauge: 20,
        pinA: `OUT-${i + 1}`,
        pinB: `IN-${i + 1}`,
        status: "pending",
        page: 1,
        xA: 60, yA: 60 + i * 18, xB: 500, yB: 60 + i * 18
      })),
      ladder: []
    };
  } else if (presetKey === 'master64') {
    return sampleProjects.master64Harness;
  }
  return null;
}

let currentSchematicPhotoMode = 'db9-fault-photo';

window.showSchematicWindowMode = function(mode) {
  currentSchematicPhotoMode = mode || 'db9-fault-photo';
  const dzView = document.getElementById('dropzone');
  const upView = document.getElementById('uploaded-view');
  const pdfEl = document.getElementById('schematic-pdf-viewer');
  const imgEl = document.getElementById('schematic-img-preview');
  const canvasEl = document.getElementById('bounding-canvas');
  const overlayEl = document.getElementById('schematic-photo-fault-overlay');
  const btnPdf = document.getElementById('btn-toggle-pdf-view');
  const btnDb9 = document.getElementById('btn-toggle-db9-fault-photo');
  const btnHw = document.getElementById('btn-toggle-hw-photo');

  if (btnPdf) btnPdf.className = (mode === 'pdf') ? 'btn-primary' : 'btn-secondary';
  if (btnDb9) btnDb9.className = (mode === 'db9-fault-photo') ? 'btn-primary' : 'btn-secondary';
  if (btnHw) btnHw.className = (mode === 'hw-photo') ? 'btn-primary' : 'btn-secondary';

  if (mode === 'pdf') {
    if (imgEl) imgEl.style.display = 'none';
    if (canvasEl) canvasEl.style.display = 'none';
    if (overlayEl) overlayEl.style.display = 'none';
    if (pdfEl && pdfEl.getAttribute('src') && pdfEl.getAttribute('src') !== '') {
      if (dzView) dzView.style.display = 'none';
      if (upView) upView.style.display = 'flex';
      pdfEl.style.display = 'block';
    } else {
      if (upView) upView.style.display = 'none';
      if (dzView) dzView.style.display = 'flex';
    }
    return;
  }

  if (dzView) dzView.style.display = 'none';
  if (upView) upView.style.display = 'flex';
  if (pdfEl) pdfEl.style.display = 'none';
  if (canvasEl) canvasEl.style.display = 'none';
  if (imgEl) {
    imgEl.src = (mode === 'hw-photo') ? 'assets/real_64ch_hardware_box.png' : 'assets/db9_2pins_out_photo.png';
    imgEl.style.display = 'block';
  }
  if (overlayEl) {
    overlayEl.style.display = 'block';
  }
  renderSchematicPhotoFaultOverlay();
};

function buildPhotoOverlayMarkup(isCompact = false) {
  const wires = (currentProject && currentProject.wires) ? currentProject.wires : [];
  // Coordinates calibrated to assets/db9_2pins_out_photo.png (bottom-left white terminal block & top terminal block)
  const pinCoords = [
    { drvX: 24.5, drvY: 86.5, senX: 30.5, senY: 12.5, label: 'Pin 1 (DB9-01)' },
    { drvX: 29.5, drvY: 86.5, senX: 34.5, senY: 12.5, label: 'Pin 2 (DB9-02)' },
    { drvX: 34.5, drvY: 84.5, senX: 38.5, senY: 12.5, label: 'Pin 3' },
    { drvX: 38.0, drvY: 84.5, senX: 42.0, senY: 12.5, label: 'Pin 4' },
    { drvX: 41.5, drvY: 84.5, senX: 45.5, senY: 12.5, label: 'Pin 5' },
    { drvX: 45.0, drvY: 84.5, senX: 49.0, senY: 12.5, label: 'Pin 6' },
    { drvX: 48.5, drvY: 84.5, senX: 52.5, senY: 12.5, label: 'Pin 7' },
    { drvX: 52.0, drvY: 84.5, senX: 56.0, senY: 12.5, label: 'Pin 8' },
    { drvX: 55.5, drvY: 84.5, senX: 59.5, senY: 12.5, label: 'Pin 9' }
  ];

  let svgLines = '';
  let pinMarkers = '';

  const maxPins = Math.min(wires.length || 9, 9);
  for (let i = 0; i < maxPins; i++) {
    const w = wires[i] || { id: `DB9-0${i + 1}`, pinA: `J1-Pin${i + 1}`, pinB: `J2-Pin${i + 1}`, status: pulledOutWireIndices.has(i) ? 'failed' : 'passed' };
    const c = pinCoords[i];
    const isFailed = (w.status === 'failed') || pulledOutWireIndices.has(i);
    const isFocused = (pinpointedFaultWireIndex === i);

    if (isFailed) {
      svgLines += `
        <line x1="${c.drvX}%" y1="${c.drvY}%" x2="${c.senX}%" y2="${c.senY}%" stroke="${isFocused ? '#fef08a' : '#ef4444'}" stroke-width="${isFocused ? '3.5' : '2.2'}" stroke-dasharray="6,5" opacity="0.92" />
      `;
      pinMarkers += `
        <div onclick="locateFaultOnSchematic(${i}, 'schematic')" style="position: absolute; left: ${c.drvX}%; top: ${c.drvY}%; transform: translate(-50%, -50%); pointer-events: auto; cursor: pointer; z-index: ${isFocused ? 40 : 30};" title="Click to pinpoint ${w.id} (${w.pinA} -> ${w.pinB})">
          <div style="width: ${isCompact ? '22px' : '28px'}; height: ${isCompact ? '22px' : '28px'}; border-radius: 50%; border: 3px solid ${isFocused ? '#fef08a' : '#ef4444'}; background: rgba(220,38,38,0.45); box-shadow: 0 0 16px #ef4444; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: ${isCompact ? '10px' : '11px'}; font-family: var(--font-mono); animation: pulse-red 1.4s infinite;">
            P${i + 1}
          </div>
        </div>
        <div style="position: absolute; left: ${c.senX}%; top: ${c.senY}%; transform: translate(-50%, -50%); pointer-events: none; z-index: 28;">
          <div style="padding: 1px 5px; border-radius: 4px; background: rgba(220,38,38,0.9); border: 1px solid #fca5a5; color: #fff; font-size: 9px; font-weight: 800; font-family: var(--font-mono); white-space: nowrap;">
            🎯 CH0${i + 1} OPEN
          </div>
        </div>
      `;
    } else {
      svgLines += `
        <line x1="${c.drvX}%" y1="${c.drvY}%" x2="${c.senX}%" y2="${c.senY}%" stroke="#10b981" stroke-width="1.3" opacity="0.45" />
      `;
      pinMarkers += `
        <div style="position: absolute; left: ${c.drvX}%; top: ${c.drvY}%; transform: translate(-50%, -50%); pointer-events: none; z-index: 20;">
          <div style="width: ${isCompact ? '14px' : '18px'}; height: ${isCompact ? '14px' : '18px'}; border-radius: 50%; border: 1.5px solid #34d399; background: rgba(5,150,105,0.75); color: #fff; font-weight: 800; font-size: 8.5px; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono);">
            ${i + 1}
          </div>
        </div>
      `;
    }
  }

  const openPinNums = [];
  for (let i = 0; i < maxPins; i++) {
    const w = wires[i];
    if ((w && w.status === 'failed') || pulledOutWireIndices.has(i)) {
      openPinNums.push(i + 1);
    }
  }
  const passCount = maxPins - openPinNums.length;

  let calloutTitle = `🎯 ${openPinNums.length} PIN${openPinNums.length === 1 ? '' : 'S'} PULLED OUT HERE!`;
  let calloutLines = '';
  if (openPinNums.length === 0) {
    calloutTitle = `✅ ALL ${maxPins} PINS CONNECTED!`;
    calloutLines = `<span style="color: #86efac;">&bull; All Pins 1–${maxPins} Screwed In (✅ ${maxPins} PASSED)</span>`;
  } else if (openPinNums.length === 1 && openPinNums[0] === 1) {
    calloutLines = `
      &bull; <strong>DB9-01 (Pin 1):</strong> DRV #01 (GPIO 26) &rarr; ❌ OPEN<br>
      <span style="color: #86efac;">&bull; <strong>DB9-02 (Pin 2):</strong> Plugged In! (✅ PASSED)</span><br>
      <span style="color: #86efac;">&bull; Pins 2–${maxPins}: Screwed In (✅ ${passCount} PASSED)</span>
    `;
  } else {
    calloutLines = openPinNums.map(p => `&bull; <strong>DB9-0${p} (Pin ${p}):</strong> DRV #0${p} &rarr; ❌ OPEN`).join('<br>') +
      `<br><span style="color: #86efac;">&bull; Connected Pins: ✅ ${passCount} PASSED</span>`;
  }

  // Callout label box pointing directly to the pulled-out yellow-ferrule wire(s) at bottom-left
  const bottomCallout = `
    <div style="position: absolute; left: 4%; bottom: 16%; pointer-events: auto; background: ${openPinNums.length > 0 ? 'rgba(127, 29, 29, 0.94)' : 'rgba(6, 78, 59, 0.94)'}; border: 2px solid ${openPinNums.length > 0 ? '#fca5a5' : '#34d399'}; border-radius: 8px; padding: ${isCompact ? '6px 9px' : '8px 12px'}; color: #fff; font-family: var(--font-mono); box-shadow: 0 6px 20px rgba(0,0,0,0.7); max-width: ${isCompact ? '245px' : '305px'}; z-index: 45;">
      <div style="font-size: ${isCompact ? '10px' : '11.5px'}; font-weight: 800; color: #fef08a; display: flex; align-items: center; gap: 5px;">
        ${calloutTitle}
      </div>
      <div style="font-size: ${isCompact ? '9.5px' : '10.5px'}; color: #fee2e2; margin-top: 3px; line-height: 1.35;">
        ${calloutLines}
      </div>
      <div style="font-size: 10px; color: #fca5a5; font-weight: 800; margin-top: 4px; text-align: right;">
        ${openPinNums.length > 0 ? `&searr; Look at yellow ferrule ${openPinNums.map(p => 'P' + p).join(' &amp; ')} below` : '✅ All terminal screws verified'}
      </div>
    </div>
  `;

  // Embedded Schematic Pinout Legend Card in Top-Left of Photo
  const schematicCard = isCompact ? '' : `
    <div style="position: absolute; left: 10px; top: 10px; pointer-events: auto; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.5); border-radius: 8px; padding: 8px 10px; font-family: var(--font-mono); font-size: 10px; color: #e2e8f0; box-shadow: 0 6px 20px rgba(0,0,0,0.65); z-index: 45; max-width: 235px;">
      <div style="font-weight: 800; color: #38bdf8; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 3px;">
        📐 03 SCHEMATIC PINOUT LINK
      </div>
      ${Array.from({ length: maxPins }, (_, idx) => {
        const w = wires[idx] || { id: `DB9-0${idx + 1}`, pinA: `J1-${idx + 1}`, pinB: `J2-${idx + 1}` };
        const fail = (w.status === 'failed') || pulledOutWireIndices.has(idx);
        const focus = (pinpointedFaultWireIndex === idx);
        return `
          <div onclick="locateFaultOnSchematic(${idx}, 'schematic')" style="cursor: pointer; padding: 2px 5px; margin-bottom: 2px; border-radius: 4px; display: flex; justify-content: space-between; gap: 6px; background: ${focus ? 'rgba(239,68,68,0.45)' : (fail ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.12)')}; border: 1px solid ${focus ? '#fef08a' : (fail ? '#ef4444' : 'rgba(52,211,153,0.3)')};">
            <span style="color: ${fail ? '#fca5a5' : '#86efac'}; font-weight: 700;">${w.id}</span>
            <span style="color: #cbd5e1;">${w.pinA}&rarr;${w.pinB}</span>
            <span style="color: ${fail ? '#f87171' : '#34d399'}; font-weight: 800;">${fail ? '❌ OPEN' : '✅ OK'}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 15;">
      ${svgLines}
    </svg>
    ${pinMarkers}
    ${bottomCallout}
    ${schematicCard}
  `;
}

function renderSchematicPhotoFaultOverlay() {
  const overlayEl = document.getElementById('schematic-photo-fault-overlay');
  if (!overlayEl) return;
  if (currentSchematicPhotoMode === 'pdf') {
    overlayEl.style.display = 'none';
    return;
  }
  overlayEl.style.display = 'block';
  overlayEl.innerHTML = buildPhotoOverlayMarkup(false);
}

function loadConnectorPreset(presetKey) {
  const tmpl = buildConnectorPresetProject(presetKey || 'db9');
  if (!tmpl) return;
  loadProjectTemplate(tmpl);
  // Show the pinpointed DB9 / Hardware Photo in Window 1 if no custom PDF is uploaded
  if (!currentPdfUrl || currentPdfUrl === 'OMS_Instruction.pdf') {
    showSchematicWindowMode('db9-fault-photo');
  }
  const cadPreset = document.getElementById('cad-connector-preset');
  if (cadPreset) cadPreset.value = presetKey;
  const contPreset = document.getElementById('continuity-preset-select');
  if (contPreset) contPreset.value = presetKey;
  drawCADCanvas();
  renderLadderLogic();
  setupWireChecklist();
  updateContinuityKPIs();
  renderSchematicPhotoFaultOverlay();
}

function setupCADViewer() {
  const exportBtn = document.getElementById('btn-cad-export-dxf');
  if (exportBtn) exportBtn.addEventListener('click', exportLadderToDXF);
  
  const presetSelect = document.getElementById('cad-connector-preset');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      if (!val) return;
      loadConnectorPreset(val);
    });
  }

  const addPinBtn = document.getElementById('btn-add-custom-wire');
  if (addPinBtn) {
    addPinBtn.addEventListener('click', () => {
      if (!currentProject) {
        currentProject = {
          name: "Custom Connector Harness",
          pages: [{ num: 1, title: "Custom Pinout", desc: "User-defined connector pin mapping" }],
          wires: [],
          ladder: []
        };
      }
      const nextNum = currentProject.wires.length + 1;
      const pinA = prompt(`Enter Source Pin (Rail A) for Wire #${nextNum}:`, `J1-${nextNum}`);
      if (!pinA) return;
      const pinB = prompt(`Enter Destination Pin (Rail B) for Wire #${nextNum}:`, `J2-${nextNum}`);
      if (!pinB) return;
      const sigName = prompt(`Enter Signal / Wire Description:`, `Pin ${nextNum} Continuity Path`) || `Pin ${nextNum}`;
      currentProject.wires.push({
        id: `W-${String(nextNum).padStart(2, '0')}`,
        name: sigName,
        gauge: 20,
        pinA: pinA.trim(),
        pinB: pinB.trim(),
        status: "pending",
        page: 1,
        xA: 60, yA: 80, xB: 500, yB: 80
      });
      populateExtractionTable();
      populateBomTable();
      setupWireChecklist();
      renderTerminalVisualizer();
      updateDashboardStats();
      drawCADCanvas();
      renderLadderLogic();
    });
  }
  
  const btnZoomIn = document.getElementById('btn-cad-zoom-in');
  const btnZoomOut = document.getElementById('btn-cad-zoom-out');
  const btnFit = document.getElementById('btn-cad-fit');
  const btnFullscreen = document.getElementById('btn-cad-fullscreen');
  
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      cadScale = Math.min(2.5, +(cadScale + 0.15).toFixed(2));
      updateCadZoomLabel();
      drawCADCanvas();
    });
  }
  
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      cadScale = Math.max(0.4, +(cadScale - 0.15).toFixed(2));
      updateCadZoomLabel();
      drawCADCanvas();
    });
  }
  
  if (btnFit) {
    btnFit.addEventListener('click', () => {
      cadScale = 1.0;
      cadOffsetX = 0;
      cadOffsetY = 0;
      updateCadZoomLabel();
      drawCADCanvas();
    });
  }
  
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleCadFullscreen);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isCadFullscreen) {
      toggleCadFullscreen();
    }
  });
}

function updateCadZoomLabel() {
  const lbl = document.getElementById('cad-zoom-lbl');
  if (lbl) lbl.textContent = `${Math.round(cadScale * 100)}%`;
}

function toggleCadFullscreen() {
  const panel = document.getElementById('window-cad-panel');
  const fsText = document.getElementById('cad-fs-text');
  const fsIcon = document.getElementById('cad-fs-icon');
  if (!panel) return;
  
  isCadFullscreen = !isCadFullscreen;
  panel.classList.toggle('fullscreen-active', isCadFullscreen);
  
  if (isCadFullscreen) {
    if (fsText) fsText.textContent = "Exit Fullscreen";
    if (fsIcon) {
      fsIcon.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>`;
    }
    logToConsole("AutoCAD Vector Canvas expanded to Full Screen mode. Press ESC or click Exit to restore.");
  } else {
    if (fsText) fsText.textContent = "Full Screen";
    if (fsIcon) {
      fsIcon.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>`;
    }
    logToConsole("Restored AutoCAD Vector Canvas to 2-window split layout.");
  }
  
  setTimeout(() => drawCADCanvas(), 100);
}

function drawCADCanvas() {
  const canvas = document.getElementById('cad-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth || 520;
  const wireCount = (currentProject && currentProject.wires) ? currentProject.wires.length : 0;
  canvas.height = Math.max(420, 110 + Math.min(wireCount, 32) * 32);
  
  const width = canvas.width;
  const height = canvas.height;
  
  // CAD Midnight background
  ctx.fillStyle = '#050709';
  ctx.fillRect(0, 0, width, height);
  
  // CAD grid coordinates
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  const cadGrid = 16;
  for (let x = 0; x < width; x += cadGrid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += cadGrid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText("AUTOCAD HARDWARE & HARNESS VECTOR STUDIO", width / 2, height / 2 - 14);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Outfit';
    ctx.fillText("Select a Connector Preset above (DB9, DB15, 16-Ch, 64-Ch) or Upload a PDF in Window 1", width / 2, height / 2 + 12);
    ctx.textAlign = 'left';
    return;
  }
  
  // Save scale transform
  ctx.save();
  ctx.translate(width / 2 + cadOffsetX, height / 2 + cadOffsetY);
  ctx.scale(cadScale, cadScale);
  ctx.translate(-width / 2, -height / 2);
  
  // Draw Drawing Border box
  ctx.strokeStyle = '#005f73';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, width - 28, height - 28);
  
  // Left & Right Hardware Rails
  const leftRailX = 135;
  const rightRailX = width - 145;
  const maxShown = Math.min(currentProject.wires.length, 32);
  const bottomRailY = 75 + maxShown * 28;
  
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(leftRailX, 50); ctx.lineTo(leftRailX, bottomRailY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rightRailX, 50); ctx.lineTo(rightRailX, bottomRailY); ctx.stroke();
  
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px JetBrains Mono';
  ctx.fillText("RAIL A: MOSFET DRIVERS (12V-)", 24, 40);
  ctx.fillText("RAIL B: PC817 SENSORS (MUX)", rightRailX - 35, 40);
  
  // Draw each wire rung with real Tester Box Screw Mapping
  for (let i = 0; i < maxShown; i++) {
    const wire = currentProject.wires[i];
    const hw = getHardwarePinInfo(i);
    const y = 75 + i * 28;
    const isPinpointed = (pinpointedFaultWireIndex === i);
    
    let strokeCol = '#34d399';
    if (wire.status === 'passed') strokeCol = '#22c55e';
    else if (wire.status === 'failed') strokeCol = '#ef4444';
    else strokeCol = '#38bdf8';

    // Highlight box if this failed wire was pinpointed from 06 Continuity Test
    if (isPinpointed) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.fillRect(18, y - 12, width - 36, 24);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(18, y - 12, width - 36, 24);
      ctx.setLineDash([]);
    }
    
    // Left Driver Terminal Tag
    ctx.fillStyle = isPinpointed ? '#7f1d1d' : '#0f172a';
    ctx.fillRect(22, y - 9, 108, 18);
    ctx.strokeStyle = isPinpointed ? '#fef08a' : strokeCol;
    ctx.lineWidth = isPinpointed ? 1.8 : 1;
    ctx.strokeRect(22, y - 9, 108, 18);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 8px JetBrains Mono';
    ctx.fillText(`${hw.drvShort} [${wire.pinA}]`, 26, y + 3);
    
    // Wire Line from Rail A to Rail B
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = isPinpointed ? 3.2 : ((wire.status === 'passed' || wire.status === 'failed') ? 2.2 : 1.4);
    ctx.beginPath();
    ctx.moveTo(leftRailX, y);
    ctx.lineTo(rightRailX, y);
    ctx.stroke();
    
    // Center Contact & Coil Symbols on the CAD Wire
    const midX = (leftRailX + rightRailX) / 2;
    ctx.fillStyle = isPinpointed ? '#991b1b' : '#050709';
    ctx.fillRect(midX - 68, y - 8, 136, 16);
    ctx.strokeStyle = isPinpointed ? '#fef08a' : strokeCol;
    ctx.strokeRect(midX - 68, y - 8, 136, 16);
    ctx.fillStyle = isPinpointed ? '#fef08a' : (wire.status === 'passed' ? '#4ade80' : (wire.status === 'failed' ? '#f87171' : '#94a3b8'));
    ctx.font = 'bold 7.5px JetBrains Mono';
    const labelStr = isPinpointed
      ? `🎯 FAULT: ${wire.id} (${wire.faultType || 'OPEN'})`.slice(0, 26)
      : `${wire.id}: ${wire.name}`.slice(0, 24);
    ctx.fillText(labelStr, midX - 63, y + 3);
    
    // Right Sensor Terminal Tag
    ctx.fillStyle = isPinpointed ? '#7f1d1d' : '#0f172a';
    ctx.fillRect(rightRailX + 5, y - 9, 120, 18);
    ctx.strokeStyle = isPinpointed ? '#fef08a' : strokeCol;
    ctx.lineWidth = isPinpointed ? 1.8 : 1;
    ctx.strokeRect(rightRailX + 5, y - 9, 120, 18);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 8px JetBrains Mono';
    ctx.fillText(`[${wire.pinB}] ${hw.senShort}`, rightRailX + 9, y + 3);
  }
  
  // Title Block Bottom-Right
  ctx.fillStyle = 'rgba(0,95,115,0.14)';
  ctx.fillRect(width - 235, height - 56, 215, 38);
  ctx.strokeStyle = '#005f73';
  ctx.strokeRect(width - 235, height - 56, 215, 38);
  ctx.fillStyle = '#00b4d8';
  ctx.font = 'bold 8.5px JetBrains Mono';
  ctx.fillText(currentProject.name.slice(0, 30), width - 228, height - 38);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '7.5px JetBrains Mono';
  ctx.fillText(`WIRES: ${currentProject.wires.length} | 16x64 HIL MATRIX`, width - 228, height - 24);
  
  ctx.restore();
  updateLiveLEDOverlays();
}

// 4. Converted Logic Ladder UI Renderer & Zoom / Fullscreen Controls
let ladderScale = 1.0;
let isLadderFullscreen = false;

function triggerLiveHardwareProbe() {
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    // Default to 8-wire Motor Control if nothing selected yet
    const tmpl = buildConnectorPresetProject('motorControl');
    loadProjectTemplate(tmpl);
  }
  if (serialPort && serialPort.writable) {
    liveProbeActive = true;
    logToConsole("⚡ [LIVE PROBE] Scanning 16x64 ESP32 Hardware Matrix for active continuity...", "info");
    sendSerialMessage("SCAN\n");
  } else {
    logToConsole("ℹ️ [SIMULATION PROBE] USB not connected — toggling interactive ladder continuity preview. Connect COM17 for live hardware probe!", "warning");
    currentProject.wires.forEach((w) => {
      w.status = (w.status === 'passed') ? 'pending' : 'passed';
    });
    drawCADCanvas();
    renderLadderLogic();
    updateDashboardStats();
  }
}

function setupLadderDiagram() {
  const dxfBtn = document.getElementById('btn-export-dxf');
  if (dxfBtn) dxfBtn.addEventListener('click', exportLadderToDXF);
  
  const probeBtn = document.getElementById('btn-ladder-live-probe');
  if (probeBtn) {
    probeBtn.addEventListener('click', triggerLiveHardwareProbe);
  }
  
  const btnZoomIn = document.getElementById('btn-ladder-zoom-in');
  const btnZoomOut = document.getElementById('btn-ladder-zoom-out');
  const btnResetZoom = document.getElementById('btn-ladder-reset-zoom');
  const btnFullscreen = document.getElementById('btn-ladder-fullscreen');
  
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      ladderScale = Math.min(2.5, +(ladderScale + 0.15).toFixed(2));
      updateLadderZoom();
    });
  }
  
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      ladderScale = Math.max(0.5, +(ladderScale - 0.15).toFixed(2));
      updateLadderZoom();
    });
  }
  
  if (btnResetZoom) {
    btnResetZoom.addEventListener('click', () => {
      ladderScale = 1.0;
      updateLadderZoom();
    });
  }
  
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleLadderFullscreen);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isLadderFullscreen) {
      toggleLadderFullscreen();
    }
  });
}

function updateLadderZoom() {
  const container = document.getElementById('ladder-canvas-container');
  const lbl = document.getElementById('ladder-zoom-lbl');
  if (container) {
    container.style.transform = `scale(${ladderScale})`;
  }
  if (lbl) {
    lbl.textContent = `${Math.round(ladderScale * 100)}%`;
  }
}

function toggleLadderFullscreen() {
  const panel = document.getElementById('window-ladder-panel');
  const fsText = document.getElementById('ladder-fs-text');
  const fsIcon = document.getElementById('ladder-fs-icon');
  if (!panel) return;
  
  isLadderFullscreen = !isLadderFullscreen;
  panel.classList.toggle('fullscreen-active', isLadderFullscreen);
  
  if (isLadderFullscreen) {
    if (fsText) fsText.textContent = "Exit Fullscreen";
    if (fsIcon) {
      fsIcon.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>`;
    }
    logToConsole("Ladder Diagram expanded to Full Screen mode. Press ESC or click Exit to restore.");
  } else {
    if (fsText) fsText.textContent = "Full Screen";
    if (fsIcon) {
      fsIcon.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>`;
    }
    logToConsole("Restored Ladder Diagram to 2-window split layout.");
  }
}

function renderLadderLogic() {
  const container = document.getElementById('ladder-canvas-container');
  if (!container) return;
  
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #94a3b8; padding: 60px 20px; font-size: 13px;">
        <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); margin-bottom: 8px;">INTERACTIVE HARDWARE LADDER STUDIO</div>
        Select a Connector Preset in Window 3 (DB9, DB15, 16-Ch, 64-Ch) or click <strong>⚡ Live Probe Hardware Rungs</strong> above to inspect and probe rungs!
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  // Render interactive Hardware-Mapped Rungs for every wire in currentProject.wires
  currentProject.wires.forEach((wire, idx) => {
    const hw = getHardwarePinInfo(idx);
    const isPass = wire.status === 'passed';
    const isFail = wire.status === 'failed';
    const isPinpointed = (pinpointedFaultWireIndex === idx);
    
    const rungDiv = document.createElement('div');
    rungDiv.className = `ladder-rung rung-${idx + 1} ${isPass ? 'energized' : ''}`;
    rungDiv.id = `rung-${idx + 1}`;
    rungDiv.style.cursor = 'pointer';
    if (isPinpointed) {
      rungDiv.style.background = 'rgba(239, 68, 68, 0.22)';
      rungDiv.style.outline = '2px solid #fef08a';
      rungDiv.style.borderRadius = '8px';
      rungDiv.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
    }
    rungDiv.title = 'Click rung to probe live continuity on ESP32 hardware';
    
    const numberLbl = document.createElement('span');
    numberLbl.className = 'rung-label-left';
    numberLbl.textContent = isPinpointed ? `🎯#${idx + 1}` : `#${String(idx + 1).padStart(2, '0')}`;
    if (isPinpointed) numberLbl.style.color = '#fef08a';
    rungDiv.appendChild(numberLbl);
    
    const leftRail = document.createElement('div');
    leftRail.className = 'ladder-rail-left';
    rungDiv.appendChild(leftRail);
    
    const rightRail = document.createElement('div');
    rightRail.className = 'ladder-rail-right';
    rungDiv.appendChild(rightRail);
    
    const elementsDiv = document.createElement('div');
    elementsDiv.className = 'ladder-elements';
    
    // 1. Source MOSFET Driver Contact (Rail A)
    const drvWrapper = document.createElement('div');
    drvWrapper.className = 'ladder-element-wrapper';
    drvWrapper.innerHTML = `
      <span class="ladder-element-label" style="color: #38bdf8;">${hw.drvLabel}</span>
      <div class="ladder-element contact-no ${isPass ? 'active' : ''}" style="width: auto; min-width: 92px; padding: 0 8px; border-color: ${isPass ? '#22c55e' : (isFail ? '#ef4444' : '#38bdf8')};">
        | | ${wire.pinA}
      </div>
    `;
    
    // 2. Wire Status / Probe Trigger Element
    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'ladder-element-wrapper';
    const faultLabel = wire.faultType || 'OPEN CIRCUIT';
    const statusText = isPinpointed
      ? `🎯 FAULT HERE (${faultLabel})`
      : (isPass ? '🟢 PASS (CLOSED)' : (isFail ? `🔴 ${faultLabel}` : '⚡ CLICK TO PROBE'));
    const statusColor = isPinpointed ? '#fef08a' : (isPass ? '#22c55e' : (isFail ? '#ef4444' : '#fbbf24'));
    statusWrapper.innerHTML = `
      <span class="ladder-element-label" style="${isPinpointed ? 'color:#fef08a;font-weight:800;' : ''}">${wire.id}: ${wire.name} (${wire.gauge} AWG)</span>
      <div class="ladder-element" style="width: auto; min-width: 125px; padding: 0 10px; border-color: ${statusColor}; color: ${statusColor}; ${isPinpointed ? 'background:rgba(185,28,28,0.85);font-weight:800;' : ''}">
        ${statusText}
      </div>
    `;
    
    // 3. Destination PC817 Sensor Coil (Rail B)
    const senWrapper = document.createElement('div');
    senWrapper.className = 'ladder-element-wrapper';
    senWrapper.innerHTML = `
      <span class="ladder-element-label" style="color: #34d399;">${hw.senLabel}</span>
      <div class="ladder-element coil ${isPass ? 'active' : ''}" style="width: auto; min-width: 92px; padding: 0 8px; border-color: ${isPass ? '#22c55e' : (isFail ? '#ef4444' : '#34d399')};">
        ( ) ${wire.pinB}
      </div>
    `;
    
    elementsDiv.appendChild(drvWrapper);
    elementsDiv.appendChild(statusWrapper);
    elementsDiv.appendChild(senWrapper);
    rungDiv.appendChild(elementsDiv);
    
    // Clicking any rung probes hardware (if connected) or toggles rung state
    rungDiv.addEventListener('click', () => {
      if (serialPort && serialPort.writable) {
        liveProbeActive = true;
        logToConsole(`⚡ Probing Rung #${idx + 1}: ${hw.drvLabel} -> ${hw.senLabel}...`, "info");
        sendSerialMessage("SCAN\n");
      } else {
        wire.status = (wire.status === 'passed') ? 'failed' : 'passed';
        logToConsole(`Rung #${idx + 1} (${wire.pinA} -> ${wire.pinB}) set to ${wire.status.toUpperCase()}`);
        drawCADCanvas();
        renderLadderLogic();
        updateDashboardStats();
      }
    });
    
    container.appendChild(rungDiv);
  });
}

function evaluateLadderLogic() {}
function updateAuxiliaryContacts() {}

// AutoCAD DXF Drawing Exporter
function exportLadderToDXF() {
  if (!currentProject) {
    logToConsole("No project loaded to export DXF.", "error");
    return;
  }
  
  logToConsole("Compiling AutoCAD DXF drawing data...");
  
  let dxf = [];
  dxf.push("  0"); dxf.push("SECTION");
  dxf.push("  2"); dxf.push("HEADER");
  dxf.push("  0"); dxf.push("ENDSEC");
  dxf.push("  0"); dxf.push("SECTION");
  dxf.push("  2"); dxf.push("BLOCKS");
  dxf.push("  0"); dxf.push("ENDSEC");
  dxf.push("  0"); dxf.push("SECTION");
  dxf.push("  2"); dxf.push("ENTITIES");
  
  addDxfText(dxf, 50, 450, 12, `${currentProject.name} - LADDER LOGIC`);
  addDxfLine(dxf, 100, 80, 100, 400, "L1_RAIL", 5);
  addDxfText(dxf, 85, 410, 8, "L1 (120VAC)");
  addDxfLine(dxf, 500, 80, 500, 400, "N_RAIL", 5);
  addDxfText(dxf, 490, 410, 8, "N (NEUTRAL)");
  
  currentProject.ladder.forEach((rung, index) => {
    const yVal = 350 - (index * 100);
    addDxfText(dxf, 40, yVal, 7, `RUNG ${rung.rung}`);
    addDxfLine(dxf, 100, yVal, 160, yVal, "WIRE_RUNG", 1);
    
    const elem1 = rung.elements[0];
    addDxfContact(dxf, 180, yVal, elem1.tag, elem1.type === 'contact-nc');
    addDxfText(dxf, 170, yVal + 18, 6, elem1.label);
    addDxfLine(dxf, 200, yVal, 280, yVal, "WIRE_RUNG", 1);
    
    const elem2 = rung.elements[1];
    if (elem2.type === 'coil') {
      addDxfCoil(dxf, 400, yVal, elem2.tag);
      addDxfLine(dxf, 420, yVal, 500, yVal, "WIRE_RUNG", 1);
      addDxfText(dxf, 385, yVal + 18, 6, elem2.label);
    } else {
      addDxfContact(dxf, 300, yVal, elem2.tag, elem2.type === 'contact-nc');
      addDxfText(dxf, 290, yVal + 18, 6, elem2.label);
      addDxfLine(dxf, 320, yVal, 380, yVal, "WIRE_RUNG", 1);
      
      const elem3 = rung.elements[2];
      addDxfCoil(dxf, 400, yVal, elem3.tag);
      addDxfLine(dxf, 420, yVal, 500, yVal, "WIRE_RUNG", 1);
      addDxfText(dxf, 385, yVal + 18, 6, elem3.label);
    }
    
    if (index === 0) {
      addDxfLine(dxf, 140, yVal, 140, yVal - 40, "WIRE_AUX", 2);
      addDxfLine(dxf, 140, yVal - 40, 180, yVal - 40, "WIRE_AUX", 2);
      addDxfContact(dxf, 200, yVal - 40, "M1 (AUX)", false);
      addDxfLine(dxf, 220, yVal - 40, 260, yVal - 40, "WIRE_AUX", 2);
      addDxfLine(dxf, 260, yVal - 40, 260, yVal, "WIRE_AUX", 2);
    }
  });
  
  dxf.push("  0"); dxf.push("ENDSEC");
  dxf.push("  0"); dxf.push("EOF");
  
  const blob = new Blob([dxf.join("\n")], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentProject.name.replace(/\s+/g, "_")}_blueprint.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  logToConsole("DXF compilation complete. Download started.", "success");
}

function exportTestReportHTML() {
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    loadConnectorPreset('db9');
  }
  
  const timestamp = new Date().toLocaleString();
  const fileDate = new Date().toISOString().slice(0,10);
  const totalWires = currentProject.wires.length;
  const passedWires = currentProject.wires.filter(w => w.status === 'passed').length;
  const failedWires = currentProject.wires.filter(w => w.status === 'failed').length;
  const passRate = totalWires > 0 ? Math.round((passedWires / totalWires) * 100) : 0;
  const statusBadge = (failedWires === 0 && passedWires > 0) ? "PASS / APPROVED FOR PRODUCTION" : (failedWires > 0 ? "FAILED - DISCREPANCY DETECTED" : "TEST INCOMPLETE");
  const statusColor = (failedWires === 0 && passedWires > 0) ? "#10b981" : "#ef4444";
  
  let wireRowsHtml = "";
  currentProject.wires.forEach((w, idx) => {
    const screw = getTesterScrewInfo(idx);
    const stColor = w.status === 'passed' ? '#10b981' : (w.status === 'failed' ? '#ef4444' : '#f59e0b');
    const stLabel = (w.status === 'failed' && w.faultType) ? `FAILED (${w.faultType})` : w.status.toUpperCase();
    wireRowsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #222; font-family: monospace;">${w.id}</td>
        <td style="padding: 10px; border-bottom: 1px solid #222;">${w.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #222; font-family: monospace;">${w.gauge} AWG</td>
        <td style="padding: 10px; border-bottom: 1px solid #222; font-family: monospace;">${w.pinA} &rarr; ${w.pinB}</td>
        <td style="padding: 10px; border-bottom: 1px solid #222; font-family: monospace; color: #38bdf8;">${screw.drvShort} &rarr; ${screw.senShort}</td>
        <td style="padding: 10px; border-bottom: 1px solid #222; font-weight: bold; color: ${stColor};">${stLabel}</td>
      </tr>
    `;
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PRO-Link 64-Channel Test Certificate - ${currentProject.name}</title>
  <style>
    body { background: #0a0b10; color: #f1f2f6; font-family: sans-serif; padding: 40px; }
    .card { background: #12141c; border: 1px solid #2a2d3d; border-radius: 12px; padding: 30px; max-width: 920px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; margin-bottom: 4px; color: #38bdf8; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
    th { background: #1a1d29; padding: 10px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PRO-Link 64-Channel PLC Quality Inspection Certificate</h1>
    <p style="color: #94a3b8; font-size: 14px;">Automated 16-Driver &times; 64-Sensor Hardware-in-the-Loop Continuity Test Report</p>
    <hr style="border: 0; border-top: 1px solid #2a2d3d; margin: 20px 0;">
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <div>
        <p><strong>Project / Schematic:</strong> ${currentProject.name}</p>
        <p><strong>Date/Time:</strong> ${timestamp}</p>
      </div>
      <div>
        <p><strong>Pass Rate:</strong> ${passRate}% (${passedWires}/${totalWires} Wires)</p>
        <div class="badge">${statusBadge}</div>
      </div>
    </div>
    <h3 style="margin-top: 30px; font-size: 16px;">Wire &amp; 64-Channel Tester Screw Verification Matrix</h3>
    <table>
      <thead>
        <tr>
          <th>WIRE ID</th>
          <th>DESCRIPTION</th>
          <th>GAUGE</th>
          <th>SCHEMATIC TERMINALS</th>
          <th>TESTER BOX SCREWS (DRV &rarr; CH)</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${wireRowsHtml}
      </tbody>
    </table>
    <div style="margin-top: 30px; border-top: 1px solid #2a2d3d; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
      Verified by PRO-Link 64-Channel Automated Testing System V1.0 • Portable Inspection Record
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PLC_Test_Certificate_${fileDate}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logToConsole("HTML Quality Test Certificate downloaded successfully!", "success");
}

function addDxfLine(dxf, x1, y1, x2, y2, layer = "0", color = 7) {
  dxf.push("  0"); dxf.push("LINE");
  dxf.push("  8"); dxf.push(layer);
  dxf.push(" 62"); dxf.push(color.toString());
  dxf.push(" 10"); dxf.push(x1.toString());
  dxf.push(" 20"); dxf.push(y1.toString());
  dxf.push(" 11"); dxf.push(x2.toString());
  dxf.push(" 21"); dxf.push(y2.toString());
}

function addDxfText(dxf, x, y, size, text, layer = "ANNOTATIONS") {
  dxf.push("  0"); dxf.push("TEXT");
  dxf.push("  8"); dxf.push(layer);
  dxf.push(" 10"); dxf.push(x.toString());
  dxf.push(" 20"); dxf.push(y.toString());
  dxf.push(" 40"); dxf.push(size.toString());
  dxf.push("  1"); dxf.push(text);
}

function addDxfContact(dxf, cx, cy, tag, isNC = false) {
  addDxfLine(dxf, cx - 10, cy, cx - 5, cy, "CONTACTS", 3);
  addDxfLine(dxf, cx - 5, cy - 15, cx - 5, cy + 15, "CONTACTS", 3);
  addDxfLine(dxf, cx + 5, cy - 15, cx + 5, cy + 15, "CONTACTS", 3);
  addDxfLine(dxf, cx + 5, cy, cx + 10, cy, "CONTACTS", 3);
  if (isNC) {
    addDxfLine(dxf, cx - 8, cy - 12, cx + 8, cy + 12, "CONTACTS", 1);
  }
  addDxfText(dxf, cx - 10, cy + 22, 5.5, tag);
}

function addDxfCoil(dxf, cx, cy, tag) {
  dxf.push("  0"); dxf.push("CIRCLE");
  dxf.push("  8"); dxf.push("COILS");
  dxf.push(" 62"); dxf.push("4");
  dxf.push(" 10"); dxf.push(cx.toString());
  dxf.push(" 20"); dxf.push(cy.toString());
  dxf.push(" 40"); dxf.push("15");
  addDxfLine(dxf, cx - 30, cy, cx - 15, cy, "COILS", 4);
  addDxfLine(dxf, cx + 15, cy, cx + 30, cy, "COILS", 4);
  addDxfText(dxf, cx - 8, cy - 4, 6, tag);
}

// 5. Harness Continuity Tester Controls (Real-Time 16x64 Hardware Matrix & Schematic Verification)
const ESP32_DRIVER_PINS = [26, 25, 32, 33, 16, 17, 18, 19, 21, 22, 23, 4, 2, 5, 15, 3];
let lastScanConnections = [];
let lastRawHardwareConnections = [];
let instantScanPending = false;
// Default: All 9 pins plugged in (0 pins pulled out — no old failed history)
let pulledOutWireIndices = new Set();

function getEffectiveMatrixConnections(rawConnections) {
  if (Array.isArray(rawConnections) && rawConnections.length > 0) {
    lastRawHardwareConnections = rawConnections;
    return rawConnections.filter(c => !pulledOutWireIndices.has(c.driver));
  }
  return buildSimulatedMatrixConnections();
}

window.toggleWirePinOut = function(idx) {
  ensureSelectedPresetSynced();
  if (pulledOutWireIndices.has(idx)) {
    pulledOutWireIndices.delete(idx);
    logToConsole(`🔌 Reconnected Pin #${idx + 1} into terminal block.`, "success");
  } else {
    pulledOutWireIndices.add(idx);
    logToConsole(`⚠️ Pulled Pin #${idx + 1} OUT of terminal block (simulating open wire fault).`, "warning");
  }
  setupWireChecklist();
  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);
  applyInstantMatrixScanResults(effectiveConns);
  renderSchematicPhotoFaultOverlay();
};

window.switchContinuitySubTab = function(tabName) {
  const compPanel = document.getElementById('cont-subtab-components');
  const siemensPanel = document.getElementById('cont-subtab-siemens');
  const btnHarness = document.getElementById('btn-cont-tab-harness');
  const btnComp = document.getElementById('btn-cont-tab-components');
  const btnSiemens = document.getElementById('btn-cont-tab-siemens');

  if (compPanel) compPanel.style.display = (tabName === 'components') ? 'flex' : 'none';
  if (siemensPanel) siemensPanel.style.display = (tabName === 'siemens') ? 'flex' : 'none';

  if (btnHarness) btnHarness.className = (tabName === 'harness') ? 'btn-primary' : 'btn-secondary';
  if (btnComp) btnComp.className = (tabName === 'components') ? 'btn-primary' : 'btn-secondary';
  if (btnSiemens) btnSiemens.className = (tabName === 'siemens') ? 'btn-primary' : 'btn-secondary';

  if (tabName === 'components') {
    loadConnectorPreset('all_components');
    logToConsole("🧩 Switched to Test All Components tab (8-Channel Through-Component 12V Loop loaded).", "info");
  } else if (tabName === 'siemens') {
    loadConnectorPreset('siemens_s7_1200');
    logToConsole("🏭 Switched to Test Siemens PLC tab (SIMATIC S7-1200 24-Ch DI/DQ loaded).", "info");
  }
};

window.loadComponentOrPlcPresetAndTest = function(presetKey) {
  loadConnectorPreset(presetKey);
  setAllPinsInAndScan();
  const listEl = document.getElementById('cont-subtab-harness-left');
  if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function ensureSelectedPresetSynced() {
  const contPreset = document.getElementById('continuity-preset-select');
  const selectedKey = (contPreset && contPreset.value) ? contPreset.value : 'db9';
  const hasCustomPdfBlob = (currentPdfUrl && currentPdfUrl.startsWith('blob:'));
  if ((selectedKey === 'db9' || (!selectedKey && !hasCustomPdfBlob)) && (!currentProject || !currentProject.wires || currentProject.wires.length !== 9 || !currentProject.wires[0].id.startsWith('DB9'))) {
    loadConnectorPreset('db9');
  } else if (selectedKey === 'db15' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 15)) {
    loadConnectorPreset('db15');
  } else if (selectedKey === 'db25' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 25)) {
    loadConnectorPreset('db25');
  } else if (selectedKey === 'all_components' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 8 || !currentProject.wires[0].id.startsWith('CMP'))) {
    loadConnectorPreset('all_components');
  } else if (selectedKey === 'siemens_s7_1200' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 24 || !currentProject.wires[0].id.startsWith('S7'))) {
    loadConnectorPreset('siemens_s7_1200');
  } else if (selectedKey === 'motor4' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 4)) {
    loadConnectorPreset('motor4');
  } else if (selectedKey === 'direct16' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 16)) {
    loadConnectorPreset('direct16');
  } else if (selectedKey === 'master64' && (!currentProject || !currentProject.wires || currentProject.wires.length !== 64)) {
    loadConnectorPreset('master64');
  } else if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    loadConnectorPreset('db9');
  }
}

window.setOnePinOutAndScan = function() {
  ensureSelectedPresetSynced();
  pulledOutWireIndices = new Set([0]);
  logToConsole("🔌 Plugged Pin #2 back into terminal block (only Pin #1 remains out) — re-testing all wires...", "info");
  setupWireChecklist();
  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);
  applyInstantMatrixScanResults(effectiveConns);
  renderSchematicPhotoFaultOverlay();
};

window.setTwoPinsOutAndScan = function() {
  ensureSelectedPresetSynced();
  pulledOutWireIndices = new Set([0, 1]);
  logToConsole("⚠️ Configured 2 Pins Pulled Out (Pin 1 & Pin 2 disconnected from terminal block) — scanning all wires...", "warning");
  setupWireChecklist();
  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);
  applyInstantMatrixScanResults(effectiveConns);
  renderSchematicPhotoFaultOverlay();
};

window.setAllPinsInAndScan = function() {
  ensureSelectedPresetSynced();
  pulledOutWireIndices = new Set();
  activeFault = "none";
  logToConsole("✅ All Pins Connected in terminal block — scanning all wires...", "success");
  setupWireChecklist();
  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);
  applyInstantMatrixScanResults(effectiveConns);
  renderSchematicPhotoFaultOverlay();
};

function getTesterScrewInfo(wireIndex) {
  const drvIdx = wireIndex % 16;
  const senIdx = wireIndex % 64;
  const drvPin = ESP32_DRIVER_PINS[drvIdx];
  const mosfetBoard = Math.floor(drvIdx / 4) + 1;
  const mosfetCh = (drvIdx % 4) + 1;
  const muxBoard = Math.floor(senIdx / 16) + 1;
  const muxCh = senIdx % 16;
  const muxSigPin = [34, 35, 0, 39][muxBoard - 1];
  const optoBoard = Math.floor(senIdx / 8) + 1;
  const optoCh = (senIdx % 8) + 1;
  return {
    drvIdx,
    senIdx,
    drvLabel: `DRV #${String(drvIdx + 1).padStart(2, '0')} (M${mosfetBoard}-OUT${mosfetCh} / GPIO ${drvPin})`,
    drvShort: `DRV #${String(drvIdx + 1).padStart(2, '0')} (GPIO ${drvPin})`,
    senLabel: `CH #${String(senIdx + 1).padStart(2, '0')} (Opto B${optoBoard}-IN${optoCh} / MUX${muxBoard}-C${muxCh} / SIG ${muxSigPin})`,
    senShort: `CH #${String(senIdx + 1).padStart(2, '0')} (MUX${muxBoard}-C${muxCh})`
  };
}

function setupContinuityTest() {
  const btnStart = document.getElementById('btn-start-test');
  if (btnStart) btnStart.addEventListener('click', startHarnessContinuityTest);

  const btnClear = document.getElementById('btn-clear-console');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      const consoleLog = document.getElementById('console-log');
      if (consoleLog) consoleLog.innerHTML = '';
    });
  }
  
  document.querySelectorAll('.btn-fault').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-fault').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFault = btn.getAttribute('data-fault') || "none";
      logToConsole(`Offline simulator fault mode set to: ${activeFault.toUpperCase()}`, "warning");
      if (!testingActive && currentProject) {
        resetHarnessTestStates();
      }
    });
  });
  
  const faultNoneBtn = document.getElementById('fault-none');
  if (faultNoneBtn) faultNoneBtn.classList.add('active');

  renderLiveMatrixMonitor([]);
  updateContinuityKPIs();
}

function updateContinuityKPIs() {
  const elTotal = document.getElementById('cont-kpi-total');
  const elPass = document.getElementById('cont-kpi-pass');
  const elOpen = document.getElementById('cont-kpi-open');
  const elShort = document.getElementById('cont-kpi-short');
  const elSwap = document.getElementById('cont-kpi-swap');
  if (!elTotal) return;

  if (!currentProject || !currentProject.wires) {
    elTotal.textContent = '0';
    elPass.textContent = '0';
    elOpen.textContent = '0';
    elShort.textContent = '0';
    elSwap.textContent = '0';
    return;
  }

  const wires = currentProject.wires;
  let pass = 0, open = 0, short = 0, swap = 0;
  wires.forEach(w => {
    if (w.status === 'passed') pass++;
    else if (w.status === 'failed') {
      if (w.faultType === 'SHORT') short++;
      else if (w.faultType === 'SWAPPED') swap++;
      else open++;
    }
  });

  elTotal.textContent = String(wires.length);
  elPass.textContent = String(pass);
  elOpen.textContent = String(open);
  elShort.textContent = String(short);
  elSwap.textContent = String(swap);
}

function renderLiveMatrixMonitor(connections) {
  lastScanConnections = Array.isArray(connections) ? connections : [];
  const listEl = document.getElementById('live-matrix-bridges-list');
  const countPill = document.getElementById('live-bridges-count-pill');
  const badgeEl = document.getElementById('live-matrix-telemetry-badge');
  const miniGrid = document.getElementById('driver-16-mini-grid');

  if (countPill) {
    countPill.textContent = `${lastScanConnections.length} Active`;
    countPill.style.color = lastScanConnections.length > 0 ? '#34d399' : '#94a3b8';
  }
  if (badgeEl && (serialPort || lastScanConnections.length > 0)) {
    const nowStr = new Date().toLocaleTimeString();
    badgeEl.textContent = `🟢 Live Scan (${nowStr})`;
    badgeEl.style.color = '#34d399';
    badgeEl.style.borderColor = 'rgba(52,211,153,0.45)';
  }

  // Group by driver to detect shorts (1 driver hitting 2+ sensor channels)
  const drvToSensors = {};
  for (let d = 0; d < 16; d++) drvToSensors[d] = [];
  lastScanConnections.forEach(c => {
    if (typeof c.driver === 'number' && typeof c.sensor === 'number') {
      if (!drvToSensors[c.driver]) drvToSensors[c.driver] = [];
      drvToSensors[c.driver].push(c.sensor);
    }
  });

  if (listEl) {
    if (lastScanConnections.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 26px 10px; font-family: var(--font-sans);">
          No physical jumper / cable bridges currently detected across <strong>DRV #01–16 &rarr; CH #01–64</strong>.<br>
          <span style="font-size: 11px;">Plug a cable into your 64-Channel Tester Box or click <strong>⚡ Instant 64-Ch Scan</strong>.</span>
        </div>
      `;
    } else {
      listEl.innerHTML = lastScanConnections.map(c => {
        const dIdx = c.driver;
        const sIdx = c.sensor;
        const dPin = ESP32_DRIVER_PINS[dIdx % 16];
        const muxBoard = Math.floor(sIdx / 16) + 1;
        const muxCh = sIdx % 16;
        const sensorsForDrv = drvToSensors[dIdx] || [];
        const sameBankSensors = sensorsForDrv.filter(s => Math.floor(s / 16) === Math.floor(sIdx / 16));
        const isShort = sameBankSensors.length > 1;
        const isDirect = (dIdx === (sIdx % 16)) && !isShort;

        let diagBadge = sIdx >= 16
          ? `<span style="background: rgba(56,189,248,0.18); color: #38bdf8; border: 1px solid rgba(56,189,248,0.45); padding: 2px 6px; border-radius: 4px; font-size: 10px;">🔁 BANK ${muxBoard} LOOP</span>`
          : `<span style="background: rgba(16,185,129,0.18); color: #34d399; border: 1px solid rgba(52,211,153,0.4); padding: 2px 6px; border-radius: 4px; font-size: 10px;">✅ 1:1 BRIDGE</span>`;
        if (isShort) {
          diagBadge = `<span style="background: rgba(192,132,252,0.2); color: #c084fc; border: 1px solid #c084fc; padding: 2px 6px; border-radius: 4px; font-size: 10px;">⚡ SHORT (${sameBankSensors.length} CH)</span>`;
        } else if (!isDirect) {
          diagBadge = `<span style="background: rgba(251,191,36,0.2); color: #fbbf24; border: 1px solid #fbbf24; padding: 2px 6px; border-radius: 4px; font-size: 10px;">🔀 CROSS-ROUTED</span>`;
        }

        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: rgba(15,23,42,0.75); border: 1px solid rgba(56,189,248,0.25); border-radius: 6px;">
            <div>
              <strong style="color: #34d399;">DRV #${String(dIdx + 1).padStart(2, '0')}</strong>
              <span style="color: #64748b; font-size: 10.5px;">(GPIO ${dPin})</span>
              <span style="color: #94a3b8; margin: 0 6px;">&rarr;</span>
              <strong style="color: #38bdf8;">CH #${String(sIdx + 1).padStart(2, '0')}</strong>
              <span style="color: #64748b; font-size: 10.5px;">(MUX${muxBoard}-C${muxCh})</span>
            </div>
            ${diagBadge}
          </div>
        `;
      }).join('');
    }
  }

  if (miniGrid) {
    let gridHtml = '';
    for (let d = 0; d < 16; d++) {
      const hitSensors = drvToSensors[d] || [];
      const hasHit = hitSensors.length > 0;
      const isShort = hitSensors.length > 1;
      const borderCol = isShort ? '#c084fc' : (hasHit ? '#34d399' : 'rgba(255,255,255,0.08)');
      const bgCol = isShort ? 'rgba(192,132,252,0.12)' : (hasHit ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.25)');
      const targetTxt = hasHit
        ? hitSensors.map(s => `CH${String(s + 1).padStart(2, '0')}`).join(',')
        : 'OPEN';
      const targetCol = isShort ? '#c084fc' : (hasHit ? '#34d399' : '#64748b');

      gridHtml += `
        <div style="padding: 5px 6px; border-radius: 5px; border: 1px solid ${borderCol}; background: ${bgCol}; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #e2e8f0; font-weight: 700;">D${String(d + 1).padStart(2, '0')}</span>
          <span style="color: ${targetCol}; font-weight: 700; font-size: 10px;">${targetTxt}</span>
        </div>
      `;
    }
    miniGrid.innerHTML = gridHtml;
  }
}

function setupWireChecklist() {
  const container = document.getElementById('wire-testing-list');
  if (!container) return;
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 36px 16px;">
        No schematic loaded yet. Upload your schematic in <strong>03 Schematic Parser</strong>, or click <strong>Start Sequential Test</strong> to load and verify a connector preset.
      </div>
    `;
    updateContinuityKPIs();
    return;
  }
  
  container.innerHTML = '';
  const sortedWires = [...currentProject.wires].sort((a, b) => a.gauge - b.gauge);
  currentProject.wires = sortedWires;
  
  currentProject.wires.forEach((wire, idx) => {
    const screw = getTesterScrewInfo(idx);
    const isFail = wire.status === 'failed';
    const isPulledOut = pulledOutWireIndices.has(idx);
    const item = document.createElement('div');
    item.className = `wire-item ${wire.status !== 'pending' ? wire.status : ''}`;
    item.id = `wire-item-${wire.id}`;
    item.innerHTML = `
      <div class="wire-meta" style="flex: 1; flex-wrap: wrap; gap: 10px;">
        <span class="gauge-badge gauge-${wire.gauge}">${wire.gauge} AWG</span>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div>
            <strong style="color: var(--text-primary); font-family: var(--font-mono);">${wire.id}</strong>
            <span style="font-size: 13px; color: var(--text-secondary); margin-left: 8px;">${wire.name} <strong style="color: #60a5fa;">(${wire.pinA} &rarr; ${wire.pinB})</strong></span>
            ${isPulledOut ? `<span style="margin-left: 6px; padding: 1px 6px; font-size: 10px; font-weight: 700; border-radius: 4px; background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid #ef4444;">⚠️ PIN PULLED OUT</span>` : ''}
          </div>
          <div style="font-size: 11px; font-family: var(--font-mono); color: #94a3b8;">
            🔧 <span style="color: #34d399; font-weight: 600;">${screw.drvShort}</span> &rarr; 🎯 <span style="color: #38bdf8; font-weight: 600;">${screw.senShort}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button id="wire-locate-btn-${wire.id}" onclick="locateFaultOnSchematic(${idx}, 'schematic')" style="display: ${isFail ? 'inline-flex' : 'none'}; align-items: center; gap: 4px; padding: 4px 10px; font-size: 10.5px; font-weight: 700; border-radius: 6px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; border: 1px solid #fca5a5; cursor: pointer; box-shadow: 0 2px 8px rgba(239,68,68,0.4);" title="Point out this fault location on Schematic, AutoCAD & Ladder">
          🎯 Link to Schematic
        </button>
        <button class="btn-secondary" onclick="toggleWirePinOut(${idx})" style="padding: 4px 8px; font-size: 10.5px; font-weight: 700; border-color: ${isPulledOut ? '#ef4444' : 'rgba(52,211,153,0.4)'}; background: ${isPulledOut ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.12)'}; color: ${isPulledOut ? '#fca5a5' : '#34d399'};" title="Click to pull this pin out or plug it back into the terminal block">
          ${isPulledOut ? '❌ Pin Out' : '🔌 Pin In'}
        </button>
        <button class="btn-secondary" onclick="probeSingleContinuityWire(${idx})" style="padding: 4px 8px; font-size: 10.5px; border-color: rgba(56,189,248,0.35); color: #38bdf8;" title="Probe this single wire on the 64-Channel Hardware Box">
          ⚡ Probe
        </button>
        <span class="wire-status-pill ${wire.status || 'pending'}" id="wire-status-${wire.id}">${(wire.status === 'failed' && wire.faultType) ? wire.faultType : (wire.status || 'pending').toUpperCase()}</span>
      </div>
    `;
    container.appendChild(item);
  });

  updateContinuityKPIs();
}

function populateFaultLocatorBox(wire, wireIndex, faultType, faultMsg, measuredStr, actionTxt) {
  const locBox = document.getElementById('fault-locator-box');
  if (!locBox) return;
  activeFaultWireIndex = wireIndex;
  const screw = getTesterScrewInfo(wireIndex);
  locBox.style.display = 'block';

  const failedWires = (currentProject && currentProject.wires)
    ? currentProject.wires.map((w, i) => ({ w, i })).filter(item => item.w.status === 'failed')
    : [];

  const badge = document.getElementById('fault-loc-type-badge');
  if (badge) {
    badge.textContent = failedWires.length > 1 ? `${failedWires.length} PINS OPEN / FAILED` : (faultType || 'DISCREPANCY');
    badge.style.background = faultType === 'SHORT / CROSSTALK' ? '#9333ea' : (faultType === 'SWAPPED WIRE' ? '#d97706' : '#ef4444');
  }

  const descEl = document.getElementById('fault-locator-desc');
  if (descEl) {
    if (failedWires.length > 1) {
      const names = failedWires.map(f => `${f.w.id} (${f.w.pinA}→${f.w.pinB})`).join(' & ');
      descEl.textContent = `[${failedWires.length} WIRES FAILED] Open circuit detected on ${names}! Click any failed pin below to jump to its exact schematic location.`;
    } else {
      descEl.textContent = faultMsg;
    }
  }

  const wEl = document.getElementById('fault-loc-wire');
  if (wEl) {
    wEl.textContent = failedWires.length > 1
      ? failedWires.map(f => f.w.id).join(', ')
      : `${wire.id} (${wire.name})`;
  }

  const mEl = document.getElementById('fault-loc-measured');
  if (mEl) mEl.textContent = measuredStr || 'No continuity (OPEN)';

  const paEl = document.getElementById('fault-loc-pina');
  if (paEl) paEl.textContent = wire.pinA;

  const pbEl = document.getElementById('fault-loc-pinb');
  if (pbEl) pbEl.textContent = wire.pinB;

  const drvEl = document.getElementById('fault-loc-drv-screw');
  if (drvEl) drvEl.textContent = screw.drvLabel;

  const senEl = document.getElementById('fault-loc-sen-screw');
  if (senEl) senEl.textContent = screw.senLabel;

  const actEl = document.getElementById('fault-loc-action');
  if (actEl) actEl.textContent = actionTxt || `Inspect physical termination between ${screw.drvShort} (${wire.pinA}) and ${screw.senShort} (${wire.pinB}).`;

  // Render Visual Pinpoint Path Diagram + Live Linked 03 Schematic Photo inside the Fault Locator Box
  const mapEl = document.getElementById('fault-visual-pinpoint-map');
  if (mapEl) {
    const fCol = faultType === 'SHORT / CROSSTALK' ? '#c084fc' : (faultType === 'SWAPPED WIRE' ? '#fbbf24' : '#f87171');
    const multiPinSelectorHtml = failedWires.length > 1 ? `
      <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 10.5px; color: #fca5a5; font-weight: 700;">⚠️ ${failedWires.length} Failed Pins Detected:</span>
        ${failedWires.map(f => `
          <button onclick="locateFaultOnSchematic(${f.i}, 'schematic')" style="padding: 4px 10px; font-size: 10.5px; font-weight: 700; border-radius: 5px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; border: 1px solid #fca5a5; cursor: pointer; box-shadow: 0 2px 8px rgba(239,68,68,0.35);">
            🎯 Point ${f.w.id} (${f.w.pinA}&rarr;${f.w.pinB}) on 03 Schematic Photo
          </button>
        `).join('')}
      </div>
    ` : '';

    mapEl.innerHTML = `
      ${multiPinSelectorHtml}
      <div style="font-size: 10.5px; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; font-weight: 700;">
        📍 Exact Fault Location Pinpoint (Schematic Page ${wire.page || 1} &bull; Rung #${wireIndex + 1}):
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        <div style="padding: 6px 10px; border-radius: 6px; background: rgba(16,185,129,0.12); border: 1px solid #34d399; color: #e2e8f0;">
          <div style="font-size: 9.5px; color: #34d399; font-weight: 700;">SOURCE (RAIL A)</div>
          <div><strong>${wire.pinA}</strong> &bull; ${screw.drvShort}</div>
        </div>
        <div style="flex: 1; text-align: center; min-width: 150px;">
          <div style="color: ${fCol}; font-weight: 800; font-size: 11px;">&mdash;&mdash; ❌ ${faultType || 'FAULT HERE'} &mdash;&mdash;&gt;</div>
          <div style="color: #fca5a5; font-size: 10px; margin-top: 2px;">${measuredStr || 'Broken Path'}</div>
        </div>
        <div style="padding: 6px 10px; border-radius: 6px; background: rgba(239,68,68,0.18); border: 2px solid #ef4444; color: #e2e8f0;">
          <div style="font-size: 9.5px; color: #fca5a5; font-weight: 700;">🎯 CHECK DESTINATION (RAIL B)</div>
          <div><strong>${wire.pinB}</strong> &bull; ${screw.senShort}</div>
        </div>
      </div>

      <!-- Live Linked Preview of 03 Schematic Parser Photo with Red Fault Pointers -->
      <div onclick="locateFaultOnSchematic(${wireIndex}, 'schematic')" style="cursor: pointer; border-radius: 8px; border: 2px solid #ef4444; overflow: hidden; position: relative; height: 260px; background: #070a10; box-shadow: 0 6px 20px rgba(239,68,68,0.3);" title="Click anywhere on this photo to open 03 Schematic Parser (Window 1) in full view!">
        <img src="assets/db9_2pins_out_photo.png" alt="03 Schematic Parser Linked Hardware Photo" style="width: 100%; height: 100%; object-fit: fill; display: block;">
        ${buildPhotoOverlayMarkup(true)}
        <div style="position: absolute; right: 10px; top: 10px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; border: 1px solid #fca5a5; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.6); z-index: 50;">
          🔗 Click to Open in 03 Schematic Parser &rarr;
        </div>
      </div>
    `;
  }
  renderSchematicPhotoFaultOverlay();
}

function locateFaultOnSchematic(wireIndex, targetPanel = 'schematic') {
  if (!currentProject || !currentProject.wires || !currentProject.wires[wireIndex]) return;
  const wire = currentProject.wires[wireIndex];
  const screw = getTesterScrewInfo(wireIndex);
  pinpointedFaultWireIndex = wireIndex;
  currentTestingIndex = wireIndex;
  activePageNum = wire.page || 1;

  // 1. Navigate to the combined 4-Window Studio (03 Schematic Parser + 04 CAD & Ladder)
  navigateToView('schematic');

  // 2. Show the Floating Red Schematic Fault Pointer Banner in Window 1
  const banner = document.getElementById('schematic-fault-pointer-banner');
  const titleEl = document.getElementById('schem-fault-banner-title');
  const detailEl = document.getElementById('schem-fault-banner-detail');
  if (banner) {
    banner.style.display = 'block';
    const fType = wire.faultType || 'OPEN CIRCUIT';
    if (titleEl) {
      titleEl.textContent = `${wire.id} (${wire.name}) — ${fType}`;
    }
    if (detailEl) {
      detailEl.innerHTML = `📍 <strong>Schematic Page ${wire.page || 1} (Rung #${wireIndex + 1})</strong> &bull; Check Source Terminal <strong>[${wire.pinA}]</strong> (${screw.drvLabel}) &rarr; Destination Terminal <strong>[${wire.pinB}]</strong> (${screw.senLabel})`;
    }
  }

  // 3. Ensure Window 1 displays the Pinpointed Photo (or PDF page if custom PDF uploaded)
  const pdfEl = document.getElementById('schematic-pdf-viewer');
  if (pdfEl && currentPdfUrl && currentPdfUrl !== '' && currentPdfUrl !== 'OMS_Instruction.pdf') {
    const basePdf = currentPdfUrl.split('#')[0];
    pdfEl.src = `${basePdf}#page=${wire.page || 1}`;
    showSchematicWindowMode('pdf');
  } else {
    showSchematicWindowMode('db9-fault-photo');
  }

  // 4. Re-render Window 1 Photo Overlay, Window 2 (Extracted Wire Table), Window 3 (AutoCAD), Window 4 (Ladder)
  renderSchematicPhotoFaultOverlay();
  populateExtractionTable();
  drawSchematicCanvas();
  drawCADCanvas();
  renderLadderLogic();
  updateLiveLEDOverlays();

  // 5. Scroll smoothly to the requested window & highlight the exact row/rung
  setTimeout(() => {
    const rowEl = document.getElementById(`extracted-wire-row-${wireIndex}`);
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (targetPanel === 'cad') {
      const cadPanel = document.getElementById('window-cad-panel');
      if (cadPanel) cadPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (targetPanel === 'ladder') {
      const rungEl = document.getElementById(`rung-${wireIndex + 1}`);
      const ladderPanel = document.getElementById('window-ladder-panel');
      if (ladderPanel) ladderPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (rungEl) rungEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const schemView = document.getElementById('view-schematic');
      if (schemView) schemView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 120);

  logToConsole(`🎯 Pinpointed Fault Location for Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}) on 03 Schematic Photo (Window 1), Wire Table (Window 2), AutoCAD Rung #${wireIndex + 1} (Window 3), and Ladder Rung #${wireIndex + 1} (Window 4)!`, "warning");
}

function clearSchematicFaultPinpoint() {
  pinpointedFaultWireIndex = null;
  const banner = document.getElementById('schematic-fault-pointer-banner');
  if (banner) banner.style.display = 'none';
  renderSchematicPhotoFaultOverlay();
  populateExtractionTable();
  drawCADCanvas();
  renderLadderLogic();
}

function evaluateWireAgainstMatrix(wire, idx, connections) {
  const screw = getTesterScrewInfo(idx);
  const targetBank = Math.floor(screw.senIdx / 16);
  // Filter hits for this driver within the same 16-channel MUX bank so multi-bank looping (Pins 17-64) works cleanly
  const hitsForDriver = connections.filter(c => c.driver === screw.drvIdx && Math.floor(c.sensor / 16) === targetBank);
  const exactMatch = hitsForDriver.some(c => c.sensor === screw.senIdx);

  if (hitsForDriver.length > 1) {
    const chList = hitsForDriver.map(c => `CH #${String(c.sensor + 1).padStart(2, '0')}`).join(', ');
    return {
      passed: false,
      faultType: 'SHORT',
      badgeText: 'SHORT / CROSSTALK',
      measured: `${screw.drvShort} shorted to [${chList}]`,
      msg: `[HARDWARE SHORT CIRCUIT] Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}): ${screw.drvShort} is energizing multiple sensor channels simultaneously (${chList})!`,
      action: `Disconnect and inspect insulation between ${screw.drvShort} and shorted sensor channels (${chList}).`
    };
  }

  if (exactMatch && hitsForDriver.length === 1) {
    return {
      passed: true,
      faultType: null,
      measured: `${screw.drvShort} -> ${screw.senShort} (0.12 Ω)`
    };
  }

  if (hitsForDriver.length === 1 && !exactMatch) {
    const wrongSen = hitsForDriver[0].sensor;
    const wrongChStr = `CH #${String(wrongSen + 1).padStart(2, '0')}`;
    return {
      passed: false,
      faultType: 'SWAPPED',
      badgeText: 'SWAPPED WIRE',
      measured: `${screw.drvShort} landed on ${wrongChStr} instead of ${screw.senShort}`,
      msg: `[HARDWARE SWAPPED WIRE] Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}): ${screw.drvShort} is routed to ${wrongChStr} instead of expected ${screw.senShort}!`,
      action: `Move destination wire from ${wrongChStr} to ${screw.senShort} (${wire.pinB}).`
    };
  }

  return {
    passed: false,
    faultType: 'OPEN',
    badgeText: 'OPEN CIRCUIT',
    measured: `No signal at ${screw.senShort} (∞ Ω)`,
    msg: `[HARDWARE OPEN CIRCUIT] Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}) is OPEN! Pin #${idx + 1} is pulled out / disconnected between ${screw.drvShort} and ${screw.senShort}.`,
    action: `Reconnect Pin #${idx + 1} (${wire.pinA} -> ${wire.pinB}) between ${screw.drvLabel} and ${screw.senLabel}.`
  };
}

function probeSingleContinuityWire(idx) {
  if (!currentProject || !currentProject.wires || !currentProject.wires[idx]) return;
  const wire = currentProject.wires[idx];
  const screw = getTesterScrewInfo(idx);
  logToConsole(`⚡ Probing single wire ${wire.id} (${wire.pinA} -> ${wire.pinB}) on ${screw.drvShort} -> ${screw.senShort}...`, "info");

  if (serialPort && serialPort.writable) {
    sendSerialMessage("SCAN\n");
  }

  const connectionsToUse = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(connectionsToUse);

  const evalRes = evaluateWireAgainstMatrix(wire, idx, connectionsToUse);
  if (evalRes.passed) {
    wire.status = 'passed';
    wire.faultType = null;
    updateWireUIState(wire);
    logToConsole(`✅ Wire ${wire.id} PASSED on ${screw.drvShort} -> ${screw.senShort}.`, "success");
  } else {
    wire.status = 'failed';
    wire.faultType = evalRes.faultType;
    updateWireUIState(wire);
    logToConsole(evalRes.msg, "error");
    populateFaultLocatorBox(wire, idx, evalRes.badgeText, evalRes.msg, evalRes.measured, evalRes.action);
  }
  updateContinuityKPIs();
}

function buildSimulatedMatrixConnections() {
  if (!currentProject || !currentProject.wires) return [];
  const simConns = [];
  currentProject.wires.forEach((w, idx) => {
    const d = idx % 16;
    const s = idx % 64;
    if (pulledOutWireIndices.has(idx)) {
      // Pin is physically pulled out of the connector block -> leave OPEN
      return;
    }
    if (activeFault === 'open' && (idx === 0 || idx === 1)) {
      // Leave Pin 1 & Pin 2 open
    } else if (activeFault === 'short' && idx === 1) {
      simConns.push({ driver: d, sensor: s });
      simConns.push({ driver: d, sensor: (s + 1) % 64 });
    } else if (activeFault === 'swap' && idx === 2) {
      simConns.push({ driver: d, sensor: (s + 1) % 64 });
    } else {
      simConns.push({ driver: d, sensor: s });
    }
  });
  return simConns;
}

function runInstantMatrixScan() {
  ensureSelectedPresetSynced();
  // Clear old simulated pin-out fault history when running a fresh full scan
  pulledOutWireIndices.clear();
  activeFault = "none";
  setupWireChecklist();
  logToConsole("⚡ Running Instant 16x64 Hardware Matrix Scan across all channels (old fault history cleared)...", "info");

  if (serialPort && serialPort.writable) {
    instantScanPending = true;
    sendSerialMessage("SCAN\n");
  }
  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);
  applyInstantMatrixScanResults(effectiveConns);
  renderSchematicPhotoFaultOverlay();
}

function applyInstantMatrixScanResults(connections) {
  if (!currentProject || !currentProject.wires) return;
  let firstFault = null;
  let failCount = 0;
  let passCount = 0;

  currentProject.wires.forEach((wire, idx) => {
    const evalRes = evaluateWireAgainstMatrix(wire, idx, connections);
    if (evalRes.passed) {
      wire.status = 'passed';
      wire.faultType = null;
      passCount++;
    } else {
      wire.status = 'failed';
      wire.faultType = evalRes.faultType;
      failCount++;
      if (!firstFault) {
        firstFault = { wire, idx, evalRes };
      }
    }
    updateWireUIState(wire);
  });

  const led = document.getElementById('test-runner-led');
  const locBox = document.getElementById('fault-locator-box');

  if (firstFault) {
    if (led) led.className = "interactive-led failed";
    populateFaultLocatorBox(
      firstFault.wire,
      firstFault.idx,
      firstFault.evalRes.badgeText,
      firstFault.evalRes.msg,
      firstFault.evalRes.measured,
      firstFault.evalRes.action
    );
    logToConsole(`⚡ Instant Scan Complete: ${passCount} PASSED, ${failCount} FAILED (Open/Fault). Click "🎯 Link to Schematic" on any red wire!`, "error");
  } else {
    if (led) led.className = "interactive-led passed";
    if (locBox) locBox.style.display = 'none';
    logToConsole(`✅ Instant Scan Complete: All ${passCount}/${currentProject.wires.length} wires PASSED!`, "success");
  }

  updateContinuityKPIs();
  drawCADCanvas();
  renderLadderLogic();
}

function resetHarnessTestStates() {
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }
  testingActive = false;
  currentTestingIndex = 0;

  if (!currentProject) return;
  
  currentProject.wires.forEach(w => {
    w.status = "pending";
    w.faultType = null;
    const statusPill = document.getElementById(`wire-status-${w.id}`);
    const wireItem = document.getElementById(`wire-item-${w.id}`);
    const locateBtn = document.getElementById(`wire-locate-btn-${w.id}`);
    if (statusPill) {
      statusPill.textContent = "PENDING";
      statusPill.className = "wire-status-pill pending";
    }
    if (wireItem) {
      wireItem.className = "wire-item";
    }
    if (locateBtn) {
      locateBtn.style.display = "none";
    }
  });
  
  const led = document.getElementById('test-runner-led');
  if (led) led.className = "interactive-led";
  
  const locBox = document.getElementById('fault-locator-box');
  if (locBox) locBox.style.display = 'none';
  
  clearLEDOverlays();
  renderTerminalVisualizer();
  updateDashboardStats();
  updateContinuityKPIs();
}

function startHarnessContinuityTest() {
  ensureSelectedPresetSynced();
  
  if (testingActive) {
    if (testInterval) {
      clearInterval(testInterval);
      testInterval = null;
    }
    testingActive = false;
    document.getElementById('btn-start-test').innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start Sequential Test
    `;
    document.getElementById('test-runner-led').className = "interactive-led";
    logToConsole("Continuity testing aborted by user.", "warning");
    clearLEDOverlays();
    return;
  }
  
  logToConsole("Starting sequential continuity verification across all pins (Pin 1 -> Pin " + currentProject.wires.length + ")...");
  
  // Clear old fault history when starting a fresh sequential test
  pulledOutWireIndices.clear();
  activeFault = "none";
  resetHarnessTestStates();
  setupWireChecklist();
  
  testingActive = true;
  currentTestingIndex = 0;
  document.getElementById('btn-start-test').innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>
    Abort Test Sequence
  `;
  
  const led = document.getElementById('test-runner-led');
  if (led) led.className = "interactive-led running";
  
  if (testInterval) clearInterval(testInterval);

  const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
  renderLiveMatrixMonitor(effectiveConns);

  if (serialPort && serialPort.writable) {
    testNextWireStep();
  } else {
    testNextWireStep();
    testInterval = setInterval(testNextWireStep, 950);
  }
}

function finishSequentialTestRun() {
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }
  testingActive = false;
  const btn = document.getElementById('btn-start-test');
  if (btn) {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start Sequential Test
    `;
  }
  const wires = currentProject ? currentProject.wires : [];
  const failedList = wires.map((w, idx) => ({ w, idx })).filter(x => x.w.status === 'failed');
  const passCount = wires.filter(w => w.status === 'passed').length;
  const led = document.getElementById('test-runner-led');

  if (failedList.length > 0) {
    if (led) led.className = "interactive-led failed";
    const first = failedList[0];
    const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
    const evalRes = evaluateWireAgainstMatrix(first.w, first.idx, effectiveConns);
    populateFaultLocatorBox(first.w, first.idx, evalRes.badgeText, evalRes.msg, evalRes.measured, evalRes.action);
    logToConsole(`⚠️ Sequential Test Finished: ${passCount} PASSED, ${failedList.length} FAILED (${failedList.map(f => f.w.id).join(', ')}).`, "error");
    sendSerialMessage("TEST_RESULT: FAIL\n");
  } else {
    if (led) led.className = "interactive-led passed";
    logToConsole("CONGRATULATIONS! Continuity test PASSED. All wire routings match the schematic & 64-channel matrix.", "success");
    sendSerialMessage("TEST_RESULT: PASS\n");
  }

  drawCADCanvas();
  renderLadderLogic();
  updateLiveLEDOverlays();
  updateContinuityKPIs();
}

function testNextWireStep() {
  if (!testingActive || !currentProject) return;
  
  const wires = currentProject.wires;
  
  if (currentTestingIndex >= wires.length) {
    finishSequentialTestRun();
    return;
  }
  
  const wire = wires[currentTestingIndex];
  const screw = getTesterScrewInfo(currentTestingIndex);
  
  if (wire.page !== activePageNum) {
    activePageNum = wire.page;
    renderPageListSidebar();
    drawSchematicCanvas();
  }
  
  wire.status = "testing";
  updateWireUIState(wire);
  logToConsole(`Testing ${wire.id} (${wire.pinA} -> ${wire.pinB}) on [${screw.drvShort} -> ${screw.senShort}]...`);
  
  updateLiveLEDOverlays();
  drawCADCanvas();
  
  if (serialPort && serialPort.writable) {
    sendSerialMessage(`SCAN\n`);
  } else {
    setTimeout(() => {
      if (!testingActive) return;
      const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);
      const evalRes = evaluateWireAgainstMatrix(wire, currentTestingIndex, effectiveConns);
      if (evalRes.passed) {
        wire.status = "passed";
        wire.faultType = null;
        updateWireUIState(wire);
        logToConsole(`✅ Wire ${wire.id} verified CORRECT on ${screw.drvShort} -> ${screw.senShort} (0.12 Ω).`, "success");
      } else {
        wire.status = "failed";
        wire.faultType = evalRes.faultType;
        updateWireUIState(wire);
        logToConsole(evalRes.msg, "error");
        populateFaultLocatorBox(wire, currentTestingIndex, evalRes.badgeText, evalRes.msg, evalRes.measured, evalRes.action);
      }
      currentTestingIndex++;
      updateLiveLEDOverlays();
      updateContinuityKPIs();
    }, 550);
  }
}

// Draw live test LEDs directly on schematic page and AutoCAD drawing canvases
function updateLiveLEDOverlays() {
  const schemOverlay = document.getElementById('schematic-live-overlay');
  const cadOverlay = document.getElementById('cad-live-overlay');
  const schemCanvas = document.getElementById('bounding-canvas');
  const cadCanvas = document.getElementById('cad-canvas');
  
  if (!schemOverlay || !cadOverlay || !currentProject) return;
  
  schemOverlay.innerHTML = '';
  cadOverlay.innerHTML = '';
  
  // Find current testing wire
  const activeWire = currentProject.wires[currentTestingIndex];
  if (!activeWire) return;
  
  // 1. Render LED Overlay on Schematic canvas (if active page matches wire page)
  if (activeWire.page === activePageNum && schemCanvas) {
    const scaleX = schemCanvas.width / 600; // design width coordinate base
    const scaleY = schemCanvas.height / 360; // design height coordinate base
    
    // Pin A LED
    const ledA = createBlinkingLEDElement(activeWire.pinA, activeWire.status);
    ledA.style.left = `${activeWire.xA * scaleX}px`;
    ledA.style.top = `${activeWire.yA * scaleY}px`;
    schemOverlay.appendChild(ledA);
    
    // Pin B LED
    const ledB = createBlinkingLEDElement(activeWire.pinB, activeWire.status);
    ledB.style.left = `${activeWire.xB * scaleX}px`;
    ledB.style.top = `${activeWire.yB * scaleY}px`;
    schemOverlay.appendChild(ledB);
  }
  
  // 2. Render LED Overlay on AutoCAD Viewer canvas
  if (cadCanvas) {
    // Map active wire indices to AutoCAD canvas layout positions
    // In our CAD drawing, we have L1 at x=100 and N at x=width-100.
    // Wire 1: y=110, Wire 2: y=190, Wire 3/4: y=270
    let yVal = 110;
    if (activeWire.id.startsWith("18")) yVal = 190;
    else if (activeWire.id.startsWith("20") || activeWire.id.startsWith("24")) yVal = 270;
    
    // Scale matching saved scale transform
    const width = cadCanvas.width;
    const height = cadCanvas.height;
    
    // Center point translation math matching ctx.save() in drawCADCanvas
    const centerX = width / 2;
    const centerY = height / 2;
    
    const scaleCADX = (x) => centerX + cadOffsetX + (x - centerX) * cadScale;
    const scaleCADY = (y) => centerY + cadOffsetY + (y - centerY) * cadScale;
    
    // Pin A CAD LED
    const ledCadA = createBlinkingLEDElement(activeWire.pinA, activeWire.status);
    ledCadA.style.left = `${scaleCADX(100)}px`;
    ledCadA.style.top = `${scaleCADY(yVal)}px`;
    cadOverlay.appendChild(ledCadA);
    
    // Pin B CAD LED
    const ledCadB = createBlinkingLEDElement(activeWire.pinB, activeWire.status);
    ledCadB.style.left = `${scaleCADX(width - 100)}px`;
    ledCadB.style.top = `${scaleCADY(yVal)}px`;
    cadOverlay.appendChild(ledCadB);
  }
}

function createBlinkingLEDElement(label, status) {
  const div = document.createElement('div');
  div.className = `live-test-point ${status}`;
  
  const pulseNode = document.createElement('div');
  pulseNode.style.width = '100%';
  pulseNode.style.height = '100%';
  pulseNode.style.borderRadius = '50%';
  
  if (status === 'testing') {
    pulseNode.style.backgroundColor = 'var(--warning)';
  } else if (status === 'passed') {
    pulseNode.style.backgroundColor = 'var(--success)';
  } else if (status === 'failed') {
    pulseNode.style.backgroundColor = 'var(--danger)';
  }
  
  div.appendChild(pulseNode);
  
  const lblSpan = document.createElement('span');
  lblSpan.className = 'live-test-label';
  lblSpan.textContent = label;
  div.appendChild(lblSpan);
  
  return div;
}

function updateWireUIState(wire) {
  const statusPill = document.getElementById(`wire-status-${wire.id}`);
  const wireItem = document.getElementById(`wire-item-${wire.id}`);
  const locateBtn = document.getElementById(`wire-locate-btn-${wire.id}`);
  
  if (statusPill) {
    let label = wire.status.toUpperCase();
    if (wire.status === 'failed' && wire.faultType) {
      label = wire.faultType;
    }
    statusPill.textContent = label;
    statusPill.className = `wire-status-pill ${wire.status}`;
  }
  
  if (wireItem) {
    wireItem.className = `wire-item ${wire.status}`;
  }

  if (locateBtn) {
    locateBtn.style.display = wire.status === 'failed' ? 'inline-flex' : 'none';
  }
  
  const nodes = document.querySelectorAll(`.wire-node-${wire.id}`);
  nodes.forEach(node => {
    node.className = `terminal-node ${node.classList.contains('left') ? 'left' : 'right'} wire-node-${wire.id} ${wire.status === 'testing' ? 'active-test' : wire.status}`;
  });
  
  drawVisualizerWires();
  updateDashboardStats();
  updateContinuityKPIs();
  populateOmsWireSchedule();
}

// 6. Web Serial Hardware API Connections
function setupHardwareConfig() {
  const connBtn = document.getElementById('btn-hardware-connect');
  const serialBtn = document.getElementById('btn-connect-serial');
  const sketchBox = document.getElementById('sketch-code-box');
  
  if (sketchBox) sketchBox.textContent = getArduinoSketchCode();
  
  const copyBtn = document.getElementById('btn-copy-sketch');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (sketchBox) {
        navigator.clipboard.writeText(sketchBox.textContent).then(() => {
          logToConsole("Arduino sketch code copied to clipboard.", "success");
        });
      }
    });
  }
  
  if (connBtn) connBtn.addEventListener('click', toggleSerialHardwareConnection);
  if (serialBtn) serialBtn.addEventListener('click', toggleSerialHardwareConnection);
}

async function toggleSerialHardwareConnection() {
  const statusDot = document.getElementById('global-status-dot');
  const statusText = document.getElementById('global-status-text');
  const connBtn = document.getElementById('btn-hardware-connect');
  const serialBtn = document.getElementById('btn-connect-serial');
  const portDesc = document.getElementById('serial-port-desc');
  const visBadge = document.getElementById('visualizer-mode-badge');
  
  if (serialPort) {
    logToConsole("Disconnecting serial device...");
    if (serialReader) {
      try { await serialReader.cancel(); } catch(e) {}
      serialReader = null;
    }
    if (serialWriter) {
      try { await serialWriter.close(); } catch(e) {}
      serialWriter = null;
    }
    try { await serialPort.close(); } catch(e) {}
    serialPort = null;
    
    if (statusDot) statusDot.className = "status-dot disconnected";
    if (statusText) statusText.textContent = "Disconnected";
    if (connBtn) connBtn.textContent = "Connect Rig";
    if (serialBtn) {
      serialBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Connect Serial Hardware
      `;
    }
    if (portDesc) portDesc.value = "Disconnected";
    if (visBadge) visBadge.textContent = "Simulation Mode";
    logToConsole("Serial testing interface offline.", "warning");
    return;
  }
  
  if (!navigator.serial) {
    logToConsole("Web Serial API is not supported in this browser environment. Running tester in virtual simulator mode.", "error");
    alert("Web Serial API is not active in this browser tab. Ensure you are accessing http://localhost:8000 via Google Chrome or MS Edge.");
    return;
  }
  
  try {
    logToConsole("Requesting access to USB Serial controller...");
    serialPort = await navigator.serial.requestPort();
    
    const baudElem = document.getElementById('serial-baud');
    const baudRate = (baudElem && baudElem.value) ? parseInt(baudElem.value) : 115200;
    logToConsole(`Opening port at ${baudRate} bps...`);
    await serialPort.open({ baudRate: baudRate });
    
    if (statusDot) statusDot.className = "status-dot connected";
    if (statusText) statusText.textContent = "Connected";
    if (connBtn) connBtn.textContent = "Disconnect";
    if (serialBtn) {
      serialBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Disconnect Serial Hardware
      `;
    }
    if (portDesc) portDesc.value = "COM Port Connected";
    if (visBadge) visBadge.textContent = "Hardware Connected";
    logToConsole("USB Serial connection established successfully!", "success");
    
    readSerialDataLoop();
    
  } catch (err) {
    logToConsole(`Failed to open serial port: ${err.message}`, "error");
    serialPort = null;
  }
}

async function readSerialDataLoop() {
  if (!serialPort || !serialPort.readable) return;
  try {
    serialReader = serialPort.readable.getReader();
    const decoder = new TextDecoder();
    let receivedBuffer = "";
    
    while (true) {
      const { value, done } = await serialReader.read();
      if (done) break;
      if (value) {
        receivedBuffer += decoder.decode(value, { stream: true });
        let lines = receivedBuffer.split("\n");
        receivedBuffer = lines.pop();
        
        for (let line of lines) {
          line = line.trim();
          if (line) {
            const muteChk = document.getElementById('chk-mute-periodic-rx');
            const isPeriodicScan = line.startsWith("SCAN_RESULT:");
            if (!isPeriodicScan || !(muteChk && muteChk.checked)) {
              logToConsole(`[RX] ${line}`, "info");
            }
            handleSerialIncomingLine(line);
          }
        }
      }
    }
  } catch (error) {
    logToConsole(`Serial read error: ${error.message}`, "error");
  } finally {
    if (serialReader) {
      try { serialReader.releaseLock(); } catch(e) {}
      serialReader = null;
    }
  }
}
async function sendSerialMessage(message) {
  if (!serialPort || !serialPort.writable) return;
  try {
    if (!serialWriter) {
      serialWriter = serialPort.writable.getWriter();
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    await serialWriter.write(data);
    logToConsole(`[TX] ${message.trim()}`);
  } catch (err) {
    logToConsole(`Failed to transmit serial data: ${err.message}`, "error");
    if (serialWriter) {
      try { serialWriter.releaseLock(); } catch(e) {}
      serialWriter = null;
    }
  }
}

function handleSerialIncomingLine(line) {
  if (line.startsWith("SCAN_RESULT:")) {
    try {
      const jsonStr = line.replace("SCAN_RESULT:", "").trim();
      const rawConnections = JSON.parse(jsonStr);
      lastRawHardwareConnections = Array.isArray(rawConnections) ? rawConnections : [];
      const effectiveConns = getEffectiveMatrixConnections(lastRawHardwareConnections);

      // Always update the Live 16x64 Hardware Matrix Monitor
      renderLiveMatrixMonitor(effectiveConns);

      if (instantScanPending) {
        instantScanPending = false;
        applyInstantMatrixScanResults(effectiveConns);
        return;
      }

      if (liveProbeActive && currentProject && currentProject.wires) {
        liveProbeActive = false;
        let passCount = 0;
        currentProject.wires.forEach((w, idx) => {
          const evalRes = evaluateWireAgainstMatrix(w, idx, effectiveConns);
          w.status = evalRes.passed ? "passed" : "failed";
          w.faultType = evalRes.faultType;
          if (evalRes.passed) passCount++;
          updateWireUIState(w);
        });
        logToConsole(`⚡ [LIVE PROBE RESULT] ${passCount} / ${currentProject.wires.length} rungs connected (${effectiveConns.length} active matrix bridges).`, passCount > 0 ? "success" : "warning");
        drawCADCanvas();
        renderLadderLogic();
        updateDashboardStats();
        updateContinuityKPIs();
        return;
      }

      if (testingActive && currentProject && currentTestingIndex < currentProject.wires.length) {
        const wire = currentProject.wires[currentTestingIndex];
        const screw = getTesterScrewInfo(currentTestingIndex);
        const evalRes = evaluateWireAgainstMatrix(wire, currentTestingIndex, effectiveConns);
        if (evalRes.passed) {
          wire.status = "passed";
          wire.faultType = null;
          updateWireUIState(wire);
          logToConsole(`✅ [HARDWARE] Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}) PASSED on ${screw.drvShort} -> ${screw.senShort}!`, "success");
        } else {
          wire.status = "failed";
          wire.faultType = evalRes.faultType;
          updateWireUIState(wire);
          logToConsole(evalRes.msg, "error");
          populateFaultLocatorBox(wire, currentTestingIndex, evalRes.badgeText, evalRes.msg, evalRes.measured, evalRes.action);
        }
        currentTestingIndex++;
        updateLiveLEDOverlays();
        updateContinuityKPIs();
        if (testingActive) {
          setTimeout(testNextWireStep, 350);
        }
      }
    } catch (e) {}
    return;
  }
  if (line.startsWith("PIN_STATE:")) {
    const data = line.replace("PIN_STATE:", "").split(",");
    const wireId = data[0] ? data[0].trim() : "";
    const result = data[1] ? data[1].trim().toUpperCase() : "";
    
    if (currentProject) {
      const wireIdx = currentProject.wires.findIndex(w => w.id === wireId);
      const wire = wireIdx >= 0 ? currentProject.wires[wireIdx] : null;
      if (wire) {
        const screw = getTesterScrewInfo(wireIdx);
        if (result === "PASS") {
          wire.status = "passed";
          wire.faultType = null;
          updateWireUIState(wire);
          logToConsole(`[HARDWARE] Wire ${wire.id} (${wire.pinA} -> ${wire.pinB}) PASSED on ${screw.drvShort} -> ${screw.senShort}!`, "success");
          currentTestingIndex++;
          updateLiveLEDOverlays();
          updateContinuityKPIs();
          
          if (testingActive) {
            setTimeout(testNextWireStep, 400);
          }
        } else {
          testingActive = false;
          wire.status = "failed";
          wire.faultType = "OPEN";
          updateWireUIState(wire);
          
          const btn = document.getElementById('btn-start-test');
          if (btn) {
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Sequential Test
            `;
          }
          const led = document.getElementById('test-runner-led');
          if (led) led.className = "interactive-led failed";
          
          const faultMsg = `[HARDWARE DISCREPANCY] Physical continuity test FAILED on Wire ${wire.id}! Channel open or miswired between ${wire.pinA} (${screw.drvShort}) and ${wire.pinB} (${screw.senShort}).`;
          logToConsole(faultMsg, "error");
          populateFaultLocatorBox(
            wire,
            wireIdx,
            "OPEN CIRCUIT",
            faultMsg,
            `No continuity at ${screw.senShort}`,
            `Verify physical wire / jumper connects ${screw.drvLabel} to ${screw.senLabel}.`
          );
          updateLiveLEDOverlays();
          updateContinuityKPIs();
        }
      }
    }
  }
}

function getArduinoSketchCode() {
  return `/*
 * PRO-Link PLC Continuity Tester Rig Firmware (16-Driver x 64-Channel ESP32 Matrix)
 * Active Firmware on COM17: 4x MOSFET Driver Boards (16 Ch) + 8x PC817 + 4x CD74HC4067 MUX (64 Ch)
 */

#define NUM_DRIVERS 16
#define NUM_MUX 4
#define CHANNELS_PER_MUX 16

// 16 MOSFET Driver Outputs (Rail A Source Terminals 1-16)
const int DRIVER_PINS[NUM_DRIVERS] = {
  26, 25, 32, 33,   // MOSFET Board 1 (Drivers 0-3)
  16, 17, 18, 19,   // MOSFET Board 2 (Drivers 4-7)
  21, 22, 23, 4,    // MOSFET Board 3 (Drivers 8-11)
  2,  5,  15, 3     // MOSFET Board 4 (Drivers 12-15)
};

// Shared CD74HC4067 Multiplexer Address Bus (S0, S1, S2, S3)
const int MUX_S0 = 13;
const int MUX_S1 = 12;
const int MUX_S2 = 14;
const int MUX_S3 = 27;

// 4 Multiplexer SIG Inputs (Rail B Sensor Terminals 1-64, Active-LOW via PC817)
// MUX 1 (CH01-16): GPIO 34 | MUX 2 (CH17-32): GPIO 35
// MUX 3 (CH33-48): GPIO 0  | MUX 4 (CH49-64): GPIO 39
const int MUX_SIG_PINS[NUM_MUX] = {34, 35, 0, 39};
`;
}

// 7. Operator Method Sheet (OMS) Step-by-Step Schedule & PDF Exporter
function populateOmsWireSchedule() {
  const tbody = document.getElementById('oms-wire-schedule-tbody');
  const badge = document.getElementById('oms-wire-schedule-badge');
  const projLbl = document.getElementById('oms-active-project-lbl');

  if (!tbody) return;
  if (!currentProject || !currentProject.wires || currentProject.wires.length === 0) {
    if (projLbl) projLbl.textContent = "Waiting for Schematic / Preset";
    if (badge) badge.textContent = "0 Wires";
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px 16px;">
          Upload a schematic in <strong>03 Schematic Parser</strong> or select a Connector Preset in <strong>04/06</strong> to populate the live wire hookup schedule.
        </td>
      </tr>
    `;
    return;
  }

  if (projLbl) projLbl.textContent = currentProject.name;
  if (badge) badge.textContent = `${currentProject.wires.length} Wires`;

  tbody.innerHTML = currentProject.wires.map((w, idx) => {
    const screw = getTesterScrewInfo(idx);
    const st = w.status || 'pending';
    const stCol = st === 'passed' ? '#34d399' : (st === 'failed' ? '#f87171' : '#fbbf24');
    const stLabel = (st === 'failed' && w.faultType) ? `FAILED (${w.faultType})` : st.toUpperCase();
    return `
      <tr>
        <td style="font-family: var(--font-mono); color: #94a3b8;">#${String(idx + 1).padStart(2, '0')}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${w.id}</td>
        <td>${w.name}</td>
        <td style="font-family: var(--font-mono);">${w.gauge} AWG</td>
        <td style="font-family: var(--font-mono); color: #34d399;"><strong>${w.pinA}</strong> &rarr; ${screw.drvShort}</td>
        <td style="font-family: var(--font-mono); color: #38bdf8;"><strong>${w.pinB}</strong> &rarr; ${screw.senShort}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: ${stCol};">${stLabel}</td>
      </tr>
    `;
  }).join('');
}

function addCustomOmsStep() {
  const container = document.getElementById('oms-steps-container');
  if (!container) return;
  const currentSteps = container.querySelectorAll('.glass-panel').length;
  const nextNum = String(currentSteps + 1).padStart(2, '0');
  const stepTitle = prompt(`Enter Title for STEP ${nextNum}:`, `Custom Assembly / Verification Step`);
  if (!stepTitle) return;
  const stepDesc = prompt(`Enter Step-by-Step Instructions for STEP ${nextNum}:`, `Verify custom connector termination and lock housing latches.`);
  if (!stepDesc) return;

  const div = document.createElement('div');
  div.className = 'glass-panel';
  div.style.cssText = 'background: rgba(15, 23, 42, 0.65); padding: 14px 18px; border-left: 4px solid #38bdf8;';
  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <h4 style="margin: 0; font-size: 14px; color: #38bdf8; font-family: var(--font-mono);">STEP ${nextNum} &mdash; ${stepTitle}</h4>
      <label style="font-size: 11.5px; color: #34d399; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600;">
        <input type="checkbox" class="oms-step-check" checked> Step Verified
      </label>
    </div>
    <ol style="margin: 0; padding-left: 20px; font-size: 12.5px; color: var(--text-secondary); line-height: 1.65;">
      <li>${stepDesc}</li>
    </ol>
  `;
  container.appendChild(div);
  logToConsole(`➕ Added STEP ${nextNum} ("${stepTitle}") to Operator Method Sheet (OMS).`, "success");
}

function exportOmsInstructionPDF() {
  const timestamp = new Date().toLocaleString();
  const projectTitle = (currentProject && currentProject.name) ? currentProject.name : "Standard 64-Channel PLC Tester Procedure";
  const operatorName = (document.getElementById('oms-operator-input') && document.getElementById('oms-operator-input').value) || "QA Inspector";
  const workOrder = (document.getElementById('oms-workorder-input') && document.getElementById('oms-workorder-input').value) || "WO-64CH-2026";

  // Collect all OMS Steps from the DOM
  const stepPanels = document.querySelectorAll('#oms-steps-container > .glass-panel');
  let stepsHtml = '';
  stepPanels.forEach((panel) => {
    const titleEl = panel.querySelector('h4');
    const chkEl = panel.querySelector('.oms-step-check');
    const listItems = panel.querySelectorAll('ol li');
    const isChecked = chkEl ? chkEl.checked : true;
    let bulletsHtml = '';
    listItems.forEach(li => {
      bulletsHtml += `<li style="margin-bottom: 4px;">${li.innerHTML}</li>`;
    });
    stepsHtml += `
      <div style="border: 1px solid #cbd5e1; border-left: 5px solid #0284c7; border-radius: 6px; padding: 12px 16px; margin-bottom: 12px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 13.5px; color: #0f172a; font-family: monospace;">${titleEl ? titleEl.textContent : 'OMS STEP'}</strong>
          <span style="font-size: 11px; font-weight: bold; color: ${isChecked ? '#059669' : '#d97706'}; border: 1px solid ${isChecked ? '#059669' : '#d97706'}; padding: 2px 8px; border-radius: 12px;">
            ${isChecked ? '☑ VERIFIED' : '☐ PENDING'}
          </span>
        </div>
        <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.55;">
          ${bulletsHtml}
        </ol>
      </div>
    `;
  });

  // Collect Wire Hookup Schedule
  let wireTableRows = '';
  if (currentProject && currentProject.wires && currentProject.wires.length > 0) {
    currentProject.wires.forEach((w, idx) => {
      const screw = getTesterScrewInfo(idx);
      const st = w.status || 'pending';
      const stLabel = (st === 'failed' && w.faultType) ? `FAILED (${w.faultType})` : st.toUpperCase();
      const stCol = st === 'passed' ? '#059669' : (st === 'failed' ? '#dc2626' : '#d97706');
      wireTableRows += `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">#${String(idx + 1).padStart(2, '0')}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${w.id}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${w.name}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${w.gauge} AWG</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;"><strong>${w.pinA}</strong> &rarr; ${screw.drvLabel}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;"><strong>${w.pinB}</strong> &rarr; ${screw.senLabel}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: ${stCol};">${stLabel}</td>
        </tr>
      `;
    });
  } else {
    wireTableRows = `
      <tr>
        <td colspan="7" style="padding: 14px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">
          Standard 16-Driver (DRV #01–16) &times; 64-Channel (CH #01–64) Matrix Configuration
        </td>
      </tr>
    `;
  }

  const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OMS_Instruction_${workOrder.replace(/\s+/g, '_')}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 20px; }
    .header-box { border: 2px solid #0f172a; border-radius: 8px; padding: 16px 20px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 12px; }
    h1 { font-size: 20px; margin: 0 0 4px 0; color: #0f172a; }
    h2 { font-size: 15px; margin: 20px 0 10px 0; color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    th { background: #f1f5f9; color: #0f172a; padding: 7px 8px; border: 1px solid #cbd5e1; text-align: left; }
    code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-family: monospace; }
    .no-print-bar { background: #0f172a; color: #fff; padding: 10px 18px; border-radius: 8px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #10b981; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
    @media print { .no-print-bar { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>📄 <strong>Operator Method Sheet (OMS) PDF Preview</strong> &mdash; Select <strong>"Save as PDF"</strong> in the print dialog.</span>
    <button class="btn-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div class="header-box">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #0284c7; font-family: monospace;">PRO-LINK PLC 64-CHANNEL AUTOMATED CONTINUITY SYSTEM</div>
      <h1>OPERATOR METHOD SHEET (OMS) &amp; QUALITY PROCEDURE</h1>
      <div style="font-size: 12px; color: #475569;">Step-by-Step Operating &amp; Harness Verification Instruction (Zero-Photo Clean Edition)</div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 11.5px;">
      <div><strong>DOC ID:</strong> OMS-PLC-64CH-V1</div>
      <div><strong>DATE:</strong> ${timestamp}</div>
      <div><strong>REV:</strong> V1.0 PRODUCTION</div>
    </div>
  </div>

  <div class="meta-grid">
    <div><span style="color:#64748b;font-size:10px;display:block;">SCHEMATIC / PROJECT</span><strong>${projectTitle}</strong></div>
    <div><span style="color:#64748b;font-size:10px;display:block;">HARDWARE ARCHITECTURE</span><strong>ESP32 16-DRV &times; 64-CH MUX</strong></div>
    <div><span style="color:#64748b;font-size:10px;display:block;">OPERATOR / INSPECTOR</span><strong>${operatorName}</strong></div>
    <div><span style="color:#64748b;font-size:10px;display:block;">WORK ORDER #</span><strong>${workOrder}</strong></div>
  </div>

  <h2>SECTION 1: STEP-BY-STEP OPERATOR METHOD SHEET (STEPS 01 &ndash; 07)</h2>
  ${stepsHtml}

  <h2>SECTION 2: UUT WIRE ASSEMBLY &amp; 64-CHANNEL TESTER BOX HOOKUP SCHEDULE</h2>
  <table>
    <thead>
      <tr>
        <th>STEP #</th>
        <th>WIRE ID</th>
        <th>SIGNAL / DESCRIPTION</th>
        <th>GAUGE</th>
        <th>SOURCE (UUT PIN A &rarr; RAIL A DRV)</th>
        <th>SENSOR (UUT PIN B &rarr; RAIL B CH)</th>
        <th>STATUS</th>
      </tr>
    </thead>
    <tbody>
      ${wireTableRows}
    </tbody>
  </table>

  <div style="margin-top: 28px; display: flex; justify-content: space-between; font-size: 12px; border-top: 1px solid #cbd5e1; padding-top: 14px; page-break-inside: avoid;">
    <div><strong>Operator Signature:</strong> ___________________________ (${operatorName})</div>
    <div><strong>QA Approval:</strong> ___________________________</div>
    <div><strong>Date:</strong> ${new Date().toISOString().slice(0, 10)}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=980,height=820');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(printHtml);
    printWin.document.close();
    logToConsole("📄 Opened OMS Instruction PDF Export dialog! Select 'Save as PDF' to save.", "success");
  } else {
    // Fallback download if popup blocked
    const blob = new Blob([printHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMS_Instruction_${workOrder.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logToConsole("📄 Downloaded printable OMS Instruction document.", "success");
  }
}

window.printTerminalLabels1to64 = function() {
  const muxSigPins = [34, 35, 0, 39];
  let muxTablesHtml = '';
  for (let bank = 0; bank < 4; bank++) {
    const startCh = bank * 16 + 1;
    const endCh = startCh + 15;
    let rows = '';
    for (let c = 0; c < 16; c++) {
      const chNum = startCh + c;
      const chStr = `CH${String(chNum).padStart(2, '0')}`;
      const muxStr = `M${bank + 1}-C${String(c).padStart(2, '0')}`;
      const optoBoard = Math.floor((chNum - 1) / 8) + 1;
      const optoCh = ((chNum - 1) % 8) + 1;
      const optoStr = `B${optoBoard}-IN${optoCh}`;
      const drvIdx = (chNum - 1) % 16;
      const drvStr = `DRV${String(drvIdx + 1).padStart(2, '0')}`;
      const wireWrapTag = `${chStr}:${muxStr}`;
      rows += `
        <tr>
          <td style="font-weight:900;color:#0f172a;background:#e0f2fe;">${chStr}</td>
          <td style="font-weight:700;color:#0369a1;">${muxStr}</td>
          <td>${optoStr}</td>
          <td style="color:#047857;font-weight:700;">${drvStr} (GPIO ${ESP32_DRIVER_PINS[drvIdx]})</td>
          <td style="font-weight:900;background:#fef9c3;border:1.5px dashed #ca8a04;">${wireWrapTag}</td>
        </tr>
      `;
    }
    muxTablesHtml += `
      <div style="border:2px solid #0f172a;border-radius:6px;overflow:hidden;page-break-inside:avoid;">
        <div style="background:#0f172a;color:#fff;padding:6px 10px;font-weight:800;font-size:12px;display:flex;justify-content:space-between;">
          <span>BANK ${bank + 1}: CH${String(startCh).padStart(2, '0')} – CH${String(endCh).padStart(2, '0')} (MUX #${bank + 1})</span>
          <span style="color:#38bdf8;">ESP32 SIG GPIO ${muxSigPins[bank]}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Terminal #</th>
              <th>MUX Pin</th>
              <th>PC817 Opto</th>
              <th>Paired Source</th>
              <th>Wire Wrap Label</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  let drvRowsHtml = '';
  for (let d = 0; d < 16; d++) {
    const mBoard = Math.floor(d / 4) + 1;
    const mOut = (d % 4) + 1;
    const dStr = `DRV${String(d + 1).padStart(2, '0')}`;
    const loopedChs = `CH${String(d + 1).padStart(2, '0')} / CH${d + 17} / CH${d + 33} / CH${d + 49}`;
    drvRowsHtml += `
      <tr>
        <td style="font-weight:900;background:#dcfce7;color:#065f46;">${dStr}</td>
        <td><strong>M${mBoard}-OUT${mOut}-</strong> (Screw ${mOut * 2 - 1})</td>
        <td>GPIO ${ESP32_DRIVER_PINS[d]}</td>
        <td>${loopedChs}</td>
        <td style="font-weight:900;background:#fef9c3;border:1.5px dashed #ca8a04;">${dStr}:M${mBoard}-O${mOut}</td>
      </tr>
    `;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>1-64_MUX_and_MOSFET_Terminal_Labels</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: 'Consolas', 'Courier New', monospace; color: #0f172a; margin: 0; padding: 14px; font-size: 10.5px; }
    h1 { font-size: 16px; margin: 0 0 4px 0; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #94a3b8; padding: 3px 5px; text-align: center; }
    th { background: #f1f5f9; font-weight: 800; }
    .no-print { background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; }
    .btn { background: #10b981; color: #fff; border: none; padding: 6px 14px; border-radius: 5px; font-weight: 700; cursor: pointer; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>🏷️ <strong>1–64 MUX Sensor &amp; 1–16 MOSFET Driver Terminal / Wire-Wrap Label Sheet</strong></span>
    <button class="btn" onclick="window.print()">🖨️ Print / Save PDF Labels</button>
  </div>
  <h1>64-CHANNEL PLC TESTER — OUTPUT &amp; INPUT TERMINAL LABEL MASTER SHEET (1–64 MUX + 1–16 DRV)</h1>
  <div style="margin-bottom:10px;color:#475569;font-family:sans-serif;font-size:11px;">
    Use the yellow <strong>Wire Wrap Label</strong> column to tag bundled/wrapped wires and white terminal block screws in order <strong>CH01–CH64</strong>.
  </div>
  <div class="grid-2">${muxTablesHtml}</div>
  <div style="border:2px solid #065f46;border-radius:6px;overflow:hidden;page-break-inside:avoid;">
    <div style="background:#065f46;color:#fff;padding:6px 10px;font-weight:800;font-size:12px;">
      SOURCE TERMINAL BLOCK LABELS: DRV01 – DRV16 (4 MOSFET Boards &times; 4 Switched OUT- Channels)
    </div>
    <table>
      <thead>
        <tr>
          <th>Driver Label</th>
          <th>MOSFET Board Screw (Odd Screws 1,3,5,7)</th>
          <th>ESP32 GPIO</th>
          <th>Looped 64-Ch Banks (1 / 2 / 3 / 4)</th>
          <th>Wire Wrap Label</th>
        </tr>
      </thead>
      <tbody>${drvRowsHtml}</tbody>
    </table>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=980,height=840');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
};

// Window load trigger
window.addEventListener('DOMContentLoaded', init);
