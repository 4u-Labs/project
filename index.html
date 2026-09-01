<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectPro 365 — Gerenciador de Projetos & Gráfico de Gantt</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- SheetJS for Excel Export -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

    <style>
        :root {
            --office-green: #107c41;
            --office-green-hover: #0b6a36;
            --office-green-light: #d8f2e2;
            --office-green-dark: #074724;
            --accent-primary: #107c41;
            --accent-highlight: #10b981;
            --accent-crit: #ef4444;
            --accent-crit-glow: rgba(239, 68, 68, 0.25);
            
            /* Theme Variables (Dark Default) */
            --bg-body: #0a0f18;
            --bg-titlebar: #0d1522;
            --bg-ribbon: #111a2c;
            --bg-ribbon-tab-active: #17233a;
            --bg-surface: #141e32;
            --bg-surface-alt: #0e1626;
            --bg-grid-row-alt: #10192a;
            --bg-grid-hover: #1b2842;
            --bg-selected: #1e335a;
            --bg-today: rgba(16, 185, 129, 0.15);
            --bg-weekend: rgba(0, 0, 0, 0.25);
            
            --border-color: #22314d;
            --border-subtle: #19253a;
            --border-focus: #107c41;
            
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            
            --gantt-bar-default: #107c41;
            --gantt-bar-progress: #34d399;
            --gantt-bar-summary: #3b82f6;
            --gantt-bar-critical: #ef4444;
            --gantt-bar-milestone: #f59e0b;
            --gantt-bar-baseline: #475569;
            
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
            --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
            --transition: all 0.18s ease;
        }

        [data-theme="light"] {
            --bg-body: #f1f5f9;
            --bg-titlebar: #107c41;
            --bg-ribbon: #ffffff;
            --bg-ribbon-tab-active: #f8fafc;
            --bg-surface: #ffffff;
            --bg-surface-alt: #f8fafc;
            --bg-grid-row-alt: #f8fafc;
            --bg-grid-hover: #f1f5f9;
            --bg-selected: #e0f2fe;
            --bg-today: rgba(16, 185, 129, 0.15);
            --bg-weekend: #f1f5f9;
            
            --border-color: #cbd5e1;
            --border-subtle: #e2e8f0;
            --border-focus: #107c41;
            
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            
            --gantt-bar-default: #107c41;
            --gantt-bar-progress: #059669;
            --gantt-bar-summary: #2563eb;
            --gantt-bar-critical: #dc2626;
            --gantt-bar-milestone: #d97706;
            --gantt-bar-baseline: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        body {
            background-color: var(--bg-body);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        /* 1. TITLEBAR */
        .office-titlebar {
            background: var(--bg-titlebar);
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 14px;
            border-bottom: 1px solid var(--border-subtle);
            user-select: none;
        }
        .titlebar-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .app-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
        }
        .app-brand-icon {
            width: 28px;
            height: 28px;
            background: var(--office-green);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #fff;
            box-shadow: 0 2px 6px rgba(16, 124, 65, 0.4);
        }
        .project-title-input {
            background: transparent;
            border: 1px solid transparent;
            color: #ffffff;
            font-weight: 600;
            font-size: 13px;
            padding: 4px 8px;
            border-radius: 4px;
            outline: none;
            transition: var(--transition);
            max-width: 260px;
        }
        .project-title-input:hover, .project-title-input:focus {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .quick-toolbar {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: 10px;
        }
        .quick-btn {
            background: transparent;
            border: none;
            color: #e2e8f0;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
            transition: var(--transition);
        }
        .quick-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }
        .titlebar-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .theme-toggle-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: var(--transition);
        }
        .theme-toggle-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* 2. RIBBON */
        .office-ribbon {
            background: var(--bg-ribbon);
            border-bottom: 1px solid var(--border-color);
            box-shadow: var(--shadow-sm);
            user-select: none;
        }
        .ribbon-tabs-nav {
            display: flex;
            align-items: center;
            padding: 0 10px;
            background: var(--bg-surface-alt);
            border-bottom: 1px solid var(--border-subtle);
            overflow-x: auto;
        }
        .ribbon-tab-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 12.5px;
            font-weight: 600;
            padding: 8px 16px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }
        .ribbon-tab-btn:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.04);
        }
        .ribbon-tab-btn.active {
            color: var(--office-green);
            background: var(--bg-ribbon);
            border-bottom-color: var(--office-green);
            font-weight: 700;
        }
        [data-theme="dark"] .ribbon-tab-btn.active {
            color: #34d399;
            border-bottom-color: #34d399;
        }

        .ribbon-content {
            padding: 8px 12px;
            display: none;
            align-items: stretch;
            gap: 12px;
            min-height: 86px;
            overflow-x: auto;
        }
        .ribbon-content.active {
            display: flex;
        }
        .ribbon-group {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 0 10px;
            border-right: 1px solid var(--border-subtle);
            min-width: fit-content;
        }
        .ribbon-group:last-child {
            border-right: none;
        }
        .ribbon-buttons-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
        }
        .ribbon-group-title {
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 4px;
        }
        
        .ribbon-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-primary);
            border-radius: 6px;
            padding: 5px 8px;
            font-size: 11.5px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-width: 52px;
            transition: var(--transition);
        }
        .ribbon-btn i {
            font-size: 15px;
            color: var(--text-secondary);
            transition: var(--transition);
        }
        .ribbon-btn:hover {
            background: var(--bg-grid-hover);
            border-color: var(--border-color);
        }
        .ribbon-btn:hover i { color: var(--office-green); }
        [data-theme="dark"] .ribbon-btn:hover i { color: #34d399; }
        .ribbon-btn.btn-primary-action {
            background: rgba(16, 124, 65, 0.12);
            border-color: rgba(16, 124, 65, 0.3);
            color: #34d399;
        }
        .ribbon-btn.btn-primary-action i { color: #34d399; }
        .ribbon-btn.active {
            background: var(--bg-selected);
            border-color: var(--office-green);
            color: var(--office-green);
        }
        [data-theme="dark"] .ribbon-btn.active {
            color: #34d399;
            border-color: #34d399;
        }

        .pct-buttons-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 2px;
        }
        .pct-btn {
            background: var(--bg-surface-alt);
            border: 1px solid var(--border-subtle);
            color: var(--text-primary);
            font-size: 10px;
            font-weight: 600;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
        }
        .pct-btn:hover {
            background: var(--office-green);
            color: #fff;
            border-color: var(--office-green);
        }

        /* 3. KPI BAR */
        .project-kpi-bar {
            background: var(--bg-surface-alt);
            border-bottom: 1px solid var(--border-subtle);
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            overflow-x: auto;
        }
        .kpi-cards-group {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .kpi-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 140px;
        }
        .kpi-icon {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
        }
        .kpi-icon.prog { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .kpi-icon.cost { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .kpi-icon.crit { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .kpi-icon.team { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .kpi-details { display: flex; flex-direction: column; }
        .kpi-label { font-size: 10.5px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
        .kpi-val { font-size: 13.5px; font-weight: 700; color: var(--text-primary); }

        .search-box {
            position: relative;
            display: flex;
            align-items: center;
        }
        .search-box i {
            position: absolute;
            left: 10px;
            color: var(--text-muted);
            font-size: 12px;
        }
        .search-input {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 10px 6px 30px;
            font-size: 12px;
            color: var(--text-primary);
            outline: none;
            width: 180px;
            transition: var(--transition);
        }
        .search-input:focus {
            border-color: var(--office-green);
            width: 220px;
        }

        /* 4. MAIN WORKSPACE */
        .main-workspace {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }

        /* GANTT VIEW */
        .gantt-view-container {
            flex: 1;
            display: flex;
            overflow: hidden;
            background: var(--bg-surface);
            position: relative;
        }

        /* LEFT PANEL: TASK LIST */
        .task-list-panel {
            width: 480px;
            min-width: 320px;
            max-width: 750px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border-color);
            background: var(--bg-surface);
            z-index: 10;
        }
        .panel-header-row {
            height: 48px;
            background: var(--bg-surface-alt);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.03em;
            user-select: none;
        }
        .col-header {
            padding: 8px 10px;
            border-right: 1px solid var(--border-subtle);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .col-id { width: 44px; text-align: center; flex-shrink: 0; }
        .col-name { flex: 1; min-width: 160px; }
        .col-dur { width: 68px; text-align: center; flex-shrink: 0; }
        .col-start { width: 88px; text-align: center; flex-shrink: 0; }
        .col-end { width: 88px; text-align: center; flex-shrink: 0; }
        .col-pred { width: 56px; text-align: center; flex-shrink: 0; }
        .col-pct { width: 52px; text-align: center; flex-shrink: 0; }

        .task-list-scroll {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .task-row {
            height: 38px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            cursor: pointer;
            transition: var(--transition);
            user-select: none;
        }
        .task-row:nth-child(even) { background: var(--bg-grid-row-alt); }
        .task-row:hover { background: var(--bg-grid-hover); }
        .task-row.selected {
            background: var(--bg-selected) !important;
            border-left: 3px solid var(--office-green);
        }
        .task-row.critical { border-left: 3px solid var(--accent-crit); }
        .task-cell {
            padding: 4px 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .task-cell-name {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .task-type-icon { font-size: 11px; color: var(--text-muted); }
        .task-type-icon.summary { color: var(--gantt-bar-summary); }
        .task-type-icon.milestone { color: var(--gantt-bar-milestone); }

        /* SPLITTER */
        .workspace-splitter {
            width: 5px;
            background: var(--border-subtle);
            cursor: col-resize;
            transition: background 0.2s;
            z-index: 20;
        }
        .workspace-splitter:hover, .workspace-splitter.dragging {
            background: var(--office-green);
        }

        /* RIGHT PANEL: GANTT CHART CANVAS */
        .gantt-chart-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--bg-surface-alt);
            position: relative;
        }
        .timeline-header-container {
            height: 48px;
            background: var(--bg-surface-alt);
            border-bottom: 1px solid var(--border-color);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .timeline-scale-primary, .timeline-scale-secondary {
            display: flex;
            height: 24px;
            border-bottom: 1px solid var(--border-subtle);
        }
        .timeline-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            border-right: 1px solid var(--border-subtle);
            flex-shrink: 0;
            user-select: none;
        }
        .timeline-cell.weekend { background: var(--bg-weekend); color: var(--text-muted); }
        .timeline-cell.today { background: var(--bg-today); color: var(--office-green); font-weight: 700; }

        .gantt-bars-container {
            flex: 1;
            overflow: auto;
            position: relative;
        }
        .gantt-grid-background {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            display: flex;
            pointer-events: none;
        }
        .gantt-grid-col {
            border-right: 1px solid var(--border-subtle);
            height: 100%;
            flex-shrink: 0;
        }
        .gantt-grid-col.weekend { background: var(--bg-weekend); }
        .gantt-grid-col.today { background: var(--bg-today); }

        .gantt-rows-layer {
            position: relative;
            z-index: 2;
        }
        .gantt-bar-row {
            height: 38px;
            position: relative;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .gantt-svg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        /* GANTT BARS */
        .gantt-bar {
            position: absolute;
            height: 20px;
            top: 9px;
            border-radius: 4px;
            background: var(--gantt-bar-default);
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: box-shadow 0.2s;
            user-select: none;
            z-index: 3;
        }
        .gantt-bar:hover {
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
            z-index: 5;
        }
        .gantt-bar.critical {
            background: var(--gantt-bar-critical);
            box-shadow: 0 0 8px var(--accent-crit-glow);
        }
        .gantt-bar.summary {
            background: var(--gantt-bar-summary);
            height: 12px;
            top: 13px;
            border-radius: 2px;
        }
        .gantt-bar.milestone {
            width: 18px !important;
            height: 18px !important;
            top: 10px;
            background: var(--gantt-bar-milestone);
            transform: rotate(45deg);
            border-radius: 3px;
            box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
        }

        .gantt-bar-progress-fill {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background: var(--gantt-bar-progress);
            border-radius: 4px 0 0 4px;
            opacity: 0.9;
            pointer-events: none;
        }
        .gantt-bar-label {
            position: absolute;
            left: calc(100% + 8px);
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            white-space: nowrap;
            pointer-events: none;
        }

        .gantt-bar-baseline {
            position: absolute;
            height: 5px;
            top: 30px;
            background: var(--gantt-bar-baseline);
            border-radius: 2px;
            opacity: 0.7;
            pointer-events: none;
        }

        /* 5. KANBAN VIEW */
        .kanban-view-container {
            flex: 1;
            display: none;
            padding: 20px;
            background: var(--bg-surface-alt);
            overflow-x: auto;
            gap: 18px;
        }
        .kanban-view-container.active { display: flex; }
        .kanban-column {
            flex: 1;
            min-width: 280px;
            max-width: 360px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            max-height: calc(100vh - 220px);
            box-shadow: var(--shadow-sm);
        }
        .kanban-col-header {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 700;
            font-size: 13px;
        }
        .kanban-col-badge {
            background: var(--bg-surface-alt);
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
        }
        .kanban-cards-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .kanban-card {
            background: var(--bg-surface-alt);
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .kanban-card:hover {
            border-color: var(--office-green);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        .kanban-card-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
        }
        .kanban-card-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: var(--text-muted);
        }
        .kanban-card-progress {
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            margin: 8px 0;
            overflow: hidden;
        }
        .kanban-card-progress-bar {
            height: 100%;
            background: var(--office-green);
            border-radius: 2px;
        }

        /* 6. RESOURCES VIEW */
        .resources-view-container {
            flex: 1;
            display: none;
            padding: 24px;
            background: var(--bg-surface-alt);
            overflow-y: auto;
        }
        .resources-view-container.active { display: block; }
        .data-table-wrapper {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .data-table th {
            background: var(--bg-surface-alt);
            padding: 12px 16px;
            text-align: left;
            font-weight: 700;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }
        .data-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-subtle);
            color: var(--text-primary);
        }
        .data-table tr:hover { background: var(--bg-grid-hover); }

        /* 7. MODALS */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(6px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-overlay.active { display: flex; }
        .modal-window {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            width: 520px;
            max-width: 95vw;
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .modal-title {
            font-size: 15px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--office-green);
        }
        [data-theme="dark"] .modal-title { color: #34d399; }
        .modal-close-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 16px;
            cursor: pointer;
        }
        .modal-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            max-height: 70vh;
            overflow-y: auto;
        }
        .form-row-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .form-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 4px;
            display: block;
        }
        .form-input, .form-select {
            width: 100%;
            background: var(--bg-surface-alt);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 13px;
            color: var(--text-primary);
            outline: none;
        }
        .form-input:focus, .form-select:focus { border-color: var(--office-green); }
        .modal-footer {
            padding: 14px 20px;
            border-top: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            background: var(--bg-surface-alt);
        }
        .btn-modal {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
        }
        .btn-modal-cancel { background: transparent; color: var(--text-secondary); }
        .btn-modal-save { background: var(--office-green); color: #fff; }

        /* 8. FOOTER */
        .footer-clean {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-subtle);
            background: var(--bg-surface);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            user-select: none;
        }
        .footer-brand {
            font-weight: 700;
            font-size: 13px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .footer-brand i { color: var(--office-green); }
        .footer-links {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition);
        }
        .footer-links a:hover {
            color: var(--office-green);
            text-decoration: underline;
        }
        .footer-links .sep { color: var(--border-color); font-size: 10px; }
    </style>
</head>
<body>

    <!-- 1. OFFICE 365 TITLEBAR -->
    <header class="office-titlebar">
        <div class="titlebar-left">
            <a href="index.html" class="app-brand">
                <div class="app-brand-icon"><i class="fas fa-chart-gantt"></i></div>
                <span>ProjectPro 365</span>
            </a>
            <input type="text" id="projectTitle" class="project-title-input" value="Cronograma Estratégico 2026" title="Clique para renomear o projeto">
            
            <div class="quick-toolbar">
                <button class="quick-btn" id="btnQuickSave" title="Salvar Projeto (Ctrl+S)"><i class="fas fa-floppy-disk"></i></button>
                <button class="quick-btn" id="btnQuickPrint" title="Imprimir Cronograma"><i class="fas fa-print"></i></button>
            </div>
        </div>

        <div class="titlebar-right">
            <button class="theme-toggle-btn" id="btnThemeToggle">
                <i class="fas fa-moon"></i> <span>Tema Escuro</span>
            </button>
        </div>
    </header>

    <!-- 2. MICROSOFT PROJECT 365 RIBBON -->
    <nav class="office-ribbon">
        <div class="ribbon-tabs-nav">
            <button class="ribbon-tab-btn active" data-tab="tab-tarefa"><i class="fas fa-list-check"></i> Tarefa</button>
            <button class="ribbon-tab-btn" data-tab="tab-recurso"><i class="fas fa-users-gear"></i> Recursos</button>
            <button class="ribbon-tab-btn" data-tab="tab-projeto"><i class="fas fa-diagram-project"></i> Projeto</button>
            <button class="ribbon-tab-btn" data-tab="tab-exibicao"><i class="fas fa-eye"></i> Exibição</button>
            <button class="ribbon-tab-btn" data-tab="tab-arquivo"><i class="fas fa-folder-open"></i> Arquivo</button>
        </div>

        <!-- TAB: TAREFA -->
        <div class="ribbon-content active" id="tab-tarefa">
            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn btn-primary-action" id="btnAddTask"><i class="fas fa-plus-circle"></i> Inserir Tarefa</button>
                    <button class="ribbon-btn" id="btnAddSubtask"><i class="fas fa-folder-plus"></i> Subtarefa</button>
                    <button class="ribbon-btn" id="btnAddMilestone"><i class="fas fa-flag-checkered"></i> Marco</button>
                    <button class="ribbon-btn" id="btnDeleteTask"><i class="fas fa-trash-can"></i> Excluir</button>
                </div>
                <div class="ribbon-group-title">Estrutura</div>
            </div>

            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnIndent"><i class="fas fa-indent"></i> Recuar</button>
                    <button class="ribbon-btn" id="btnOutdent"><i class="fas fa-outdent"></i> Avançar</button>
                </div>
                <div class="ribbon-group-title">Hierarquia</div>
            </div>

            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <div class="pct-buttons-grid">
                        <button class="pct-btn" data-pct="0">0%</button>
                        <button class="pct-btn" data-pct="25">25%</button>
                        <button class="pct-btn" data-pct="50">50%</button>
                        <button class="pct-btn" data-pct="75">75%</button>
                        <button class="pct-btn" data-pct="100">100%</button>
                    </div>
                </div>
                <div class="ribbon-group-title">Conclusão</div>
            </div>
        </div>

        <!-- TAB: RECURSO -->
        <div class="ribbon-content" id="tab-recurso">
            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnResourceSheet"><i class="fas fa-table-list"></i> Planilha da Equipe</button>
                </div>
                <div class="ribbon-group-title">Membros & Funções</div>
            </div>
        </div>

        <!-- TAB: PROJETO -->
        <div class="ribbon-content" id="tab-projeto">
            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnSetBaseline"><i class="fas fa-camera"></i> Salvar Linha de Base</button>
                    <button class="ribbon-btn" id="btnToggleCritical"><i class="fas fa-fire"></i> Caminho Crítico</button>
                </div>
                <div class="ribbon-group-title">Controle & Prazos</div>
            </div>
        </div>

        <!-- TAB: EXIBIÇÃO -->
        <div class="ribbon-content" id="tab-exibicao">
            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn active" id="btnViewGantt"><i class="fas fa-chart-gantt"></i> Gráfico Gantt</button>
                    <button class="ribbon-btn" id="btnViewKanban"><i class="fas fa-table-columns"></i> Quadro Kanban</button>
                    <button class="ribbon-btn" id="btnViewResources"><i class="fas fa-users-viewfinder"></i> Carga Equipe</button>
                </div>
                <div class="ribbon-group-title">Modos de Visualização</div>
            </div>

            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnZoomIn"><i class="fas fa-magnifying-glass-plus"></i> Dias</button>
                    <button class="ribbon-btn" id="btnZoomFit"><i class="fas fa-calendar-week"></i> Semanas</button>
                    <button class="ribbon-btn" id="btnZoomOut"><i class="fas fa-magnifying-glass-minus"></i> Meses</button>
                    <button class="ribbon-btn" id="btnToday"><i class="fas fa-calendar-check"></i> Hoje</button>
                </div>
                <div class="ribbon-group-title">Escala de Tempo</div>
            </div>
        </div>

        <!-- TAB: ARQUIVO -->
        <div class="ribbon-content" id="tab-arquivo">
            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnNewProject"><i class="fas fa-file-circle-plus"></i> Novo</button>
                    <button class="ribbon-btn" id="btnSaveFile"><i class="fas fa-floppy-disk"></i> Salvar (.json)</button>
                    <button class="ribbon-btn" id="btnLoadFile"><i class="fas fa-folder-open"></i> Abrir</button>
                    <input type="file" id="fileInput" accept=".json" style="display:none">
                </div>
                <div class="ribbon-group-title">Projeto</div>
            </div>

            <div class="ribbon-group">
                <div class="ribbon-buttons-row">
                    <button class="ribbon-btn" id="btnExportExcel"><i class="fas fa-file-excel" style="color:#107c41;"></i> Excel (.xlsx)</button>
                    <button class="ribbon-btn" id="btnExportPDF"><i class="fas fa-file-pdf" style="color:#ef4444;"></i> Imprimir / PDF</button>
                </div>
                <div class="ribbon-group-title">Exportações</div>
            </div>
        </div>
    </nav>

    <!-- 3. KPI & STATUS BAR -->
    <div class="project-kpi-bar">
        <div class="kpi-cards-group">
            <div class="kpi-card">
                <div class="kpi-icon prog"><i class="fas fa-chart-line"></i></div>
                <div class="kpi-details">
                    <span class="kpi-label">Progresso Geral</span>
                    <span class="kpi-val" id="kpiProgress">0%</span>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon cost"><i class="fas fa-wallet"></i></div>
                <div class="kpi-details">
                    <span class="kpi-label">Custo Estimado</span>
                    <span class="kpi-val" id="kpiCost">R$ 0,00</span>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon crit"><i class="fas fa-triangle-exclamation"></i></div>
                <div class="kpi-details">
                    <span class="kpi-label">Tarefas Críticas</span>
                    <span class="kpi-val" id="kpiCritical">0</span>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon team"><i class="fas fa-users"></i></div>
                <div class="kpi-details">
                    <span class="kpi-label">Recursos Alocados</span>
                    <span class="kpi-val" id="kpiResources">0 membros</span>
                </div>
            </div>
        </div>

        <div class="search-filter-group">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="taskSearchInput" class="search-input" placeholder="Buscar tarefas...">
            </div>
        </div>
    </div>

    <!-- 4. MAIN WORKSPACE CONTAINER -->
    <main class="main-workspace" id="mainWorkspace">

        <!-- VIEW 1: GANTT CHART -->
        <div class="gantt-view-container" id="ganttViewContainer">
            
            <!-- LEFT PANEL: TASK LIST -->
            <div class="task-list-panel" id="taskListPanel">
                <div class="panel-header-row">
                    <div class="col-header col-id">#</div>
                    <div class="col-header col-name">Nome da Tarefa</div>
                    <div class="col-header col-dur">Duração</div>
                    <div class="col-header col-start">Início</div>
                    <div class="col-header col-end">Término</div>
                    <div class="col-header col-pred">Pred.</div>
                    <div class="col-header col-pct">%</div>
                </div>

                <div class="task-list-scroll" id="taskListScroll">
                    <!-- Task rows injected dynamically -->
                </div>
            </div>

            <!-- SPLITTER -->
            <div class="workspace-splitter" id="workspaceSplitter"></div>

            <!-- RIGHT PANEL: GANTT CHART CANVAS -->
            <div class="gantt-chart-panel" id="ganttChartPanel">
                <div class="timeline-header-container" id="timelineHeader">
                    <!-- Scale rows injected dynamically -->
                </div>

                <div class="gantt-bars-container" id="ganttBarsContainer">
                    <div class="gantt-grid-background" id="ganttGridBackground"></div>
                    <svg class="gantt-svg-layer" id="ganttSvgLayer"></svg>
                    <div class="gantt-rows-layer" id="ganttRowsLayer">
                        <!-- Bars injected dynamically -->
                    </div>
                </div>
            </div>
        </div>

        <!-- VIEW 2: KANBAN AGILE BOARD -->
        <div class="kanban-view-container" id="kanbanViewContainer">
            <div class="kanban-column" data-status="todo">
                <div class="kanban-col-header">
                    <span><i class="fas fa-circle-dot" style="color:#94a3b8;"></i> A Fazer</span>
                    <span class="kanban-col-badge" id="badgeTodo">0</span>
                </div>
                <div class="kanban-cards-list" id="kanbanListTodo"></div>
            </div>

            <div class="kanban-column" data-status="inprogress">
                <div class="kanban-col-header">
                    <span><i class="fas fa-spinner" style="color:#3b82f6;"></i> Em Andamento</span>
                    <span class="kanban-col-badge" id="badgeInProgress">0</span>
                </div>
                <div class="kanban-cards-list" id="kanbanListInProgress"></div>
            </div>

            <div class="kanban-column" data-status="review">
                <div class="kanban-col-header">
                    <span><i class="fas fa-clock" style="color:#f59e0b;"></i> Em Revisão</span>
                    <span class="kanban-col-badge" id="badgeReview">0</span>
                </div>
                <div class="kanban-cards-list" id="kanbanListReview"></div>
            </div>

            <div class="kanban-column" data-status="done">
                <div class="kanban-col-header">
                    <span><i class="fas fa-circle-check" style="color:#10b981;"></i> Concluído</span>
                    <span class="kanban-col-badge" id="badgeDone">0</span>
                </div>
                <div class="kanban-cards-list" id="kanbanListDone"></div>
            </div>
        </div>

        <!-- VIEW 3: RESOURCES & WORKLOAD -->
        <div class="resources-view-container" id="resourcesViewContainer">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome do Recurso / Membro</th>
                            <th>Função</th>
                            <th>Valor Hora (R$)</th>
                            <th>Tarefas Atribuídas</th>
                            <th>Horas Totais</th>
                            <th>Custo Total</th>
                        </tr>
                    </thead>
                    <tbody id="resourcesTableBody">
                        <!-- Injected dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- TASK EDIT MODAL -->
    <div class="modal-overlay" id="taskModal">
        <div class="modal-window">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-pen-to-square"></i> Detalhes da Tarefa</span>
                <button class="modal-close-btn" onclick="closeModal('taskModal')"><i class="fas fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div>
                    <label class="form-label">Nome da Tarefa</label>
                    <input type="text" id="modalTaskName" class="form-input" placeholder="Ex: Planejamento Inicial">
                </div>

                <div class="form-row-2">
                    <div>
                        <label class="form-label">Data de Início</label>
                        <input type="date" id="modalTaskStart" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Data de Término</label>
                        <input type="date" id="modalTaskEnd" class="form-input">
                    </div>
                </div>

                <div class="form-row-2">
                    <div>
                        <label class="form-label">Duração (dias)</label>
                        <input type="number" id="modalTaskDuration" class="form-input" min="0">
                    </div>
                    <div>
                        <label class="form-label">% Concluído</label>
                        <input type="number" id="modalTaskProgress" class="form-input" min="0" max="100" step="5">
                    </div>
                </div>

                <div class="form-row-2">
                    <div>
                        <label class="form-label">Predecessora (ID)</label>
                        <input type="text" id="modalTaskPred" class="form-input" placeholder="Ex: 1, 2">
                    </div>
                    <div>
                        <label class="form-label">Responsável / Recurso</label>
                        <select id="modalTaskResource" class="form-select"></select>
                    </div>
                </div>

                <div class="form-row-2">
                    <div>
                        <label class="form-label">Tipo de Tarefa</label>
                        <select id="modalTaskType" class="form-select">
                            <option value="task">Tarefa Padrão</option>
                            <option value="milestone">Marco (Milestone)</option>
                            <option value="summary">Resumo (Fase)</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cor da Barra</label>
                        <input type="color" id="modalTaskColor" class="form-input" value="#107c41" style="height: 38px; padding: 2px;">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-modal-cancel" onclick="closeModal('taskModal')">Cancelar</button>
                <button class="btn-modal btn-modal-save" id="btnSaveTaskModal">Salvar Alterações</button>
            </div>
        </div>
    </div>

    <!-- STANDARD 4U.IA.BR FOOTER -->
    <footer class="footer-clean">
        <div class="footer-brand">
            <i class="fas fa-chart-gantt"></i> <span>ProjectPro 365 — 4U.IA.BR</span>
        </div>
        <div class="footer-links">
            <a href="privacidade.php">Privacidade</a>
            <span class="sep">•</span>
            <a href="termos.php">Termos de Uso</a>
            <span class="sep">•</span>
            <a href="suporte.php">Suporte & FAQ</a>
        </div>
        <div class="footer-copyright">
            &copy; <span id="year"><?php echo date('Y'); ?></span> 4U.IA.BR — Suíte de Gerenciamento de Projetos & Gráficos de Gantt. Retenção zero.
        </div>
    </footer>

    <!-- APP JAVASCRIPT ENGINE -->
    <script>
        class ProjectApp {
            constructor() {
                this.tasks = [];
                this.resources = [
                    { id: 1, name: 'Engenheiro Chefe', role: 'Gestão', rate: 120 },
                    { id: 2, name: 'Desenvolvedor Sênior', role: 'TI & Dev', rate: 95 },
                    { id: 3, name: 'Designer UI/UX', role: 'Design', rate: 80 },
                    { id: 4, name: 'Analista de QA', role: 'Qualidade', rate: 65 }
                ];
                this.selectedTaskId = null;
                this.zoomLevel = 'day';
                this.cellWidth = 36;
                this.showCriticalPath = false;

                this.init();
            }

            init() {
                this.loadFromStorage();
                if (!this.tasks || this.tasks.length === 0) {
                    this.loadSampleProject();
                }
                this.setupEventListeners();
                this.render();
                this.updateDynamicYear();
            }

            loadSampleProject() {
                const today = new Date();
                const d = (days) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() + days);
                    return date.toISOString().split('T')[0];
                };

                this.tasks = [
                    { id: 1, name: '1. FASE DE CONCEPÇÃO & ESCOPO', start: d(0), end: d(8), duration: 8, progress: 90, pred: '', resourceId: 1, type: 'summary', expanded: true, baselineStart: d(0), baselineEnd: d(8) },
                    { id: 2, name: 'Definição de Requisitos e Metas', start: d(0), end: d(3), duration: 3, progress: 100, pred: '', resourceId: 1, type: 'task', parentId: 1 },
                    { id: 3, name: 'Prototipagem de Telas e Fluxos', start: d(3), end: d(7), duration: 4, progress: 85, pred: '2', resourceId: 3, type: 'task', parentId: 1 },
                    { id: 4, name: 'Aprovação do Escopo Executivo', start: d(8), end: d(8), duration: 0, progress: 100, pred: '3', resourceId: 1, type: 'milestone', parentId: 1 },
                    
                    { id: 5, name: '2. DESENVOLVIMENTO & ENGENHARIA', start: d(9), end: d(24), duration: 15, progress: 45, pred: '4', resourceId: 2, type: 'summary', expanded: true, baselineStart: d(9), baselineEnd: d(24) },
                    { id: 6, name: 'Arquitetura de Dados e APIs', start: d(9), end: d(14), duration: 5, progress: 80, pred: '4', resourceId: 2, type: 'task', parentId: 5 },
                    { id: 7, name: 'Desenvolvimento das Funcionalidades Core', start: d(14), end: d(22), duration: 8, progress: 35, pred: '6', resourceId: 2, type: 'task', parentId: 5 },
                    { id: 8, name: 'Testes Integrados & Homologação', start: d(22), end: d(24), duration: 2, progress: 0, pred: '7', resourceId: 4, type: 'task', parentId: 5 },
                    
                    { id: 9, name: '3. LANÇAMENTO & GO-LIVE', start: d(25), end: d(28), duration: 3, progress: 0, pred: '8', resourceId: 1, type: 'summary', expanded: true },
                    { id: 10, name: 'Treinamento de Equipes e Documentação', start: d(25), end: d(27), duration: 2, progress: 0, pred: '8', resourceId: 1, type: 'task', parentId: 9 },
                    { id: 11, name: '🚀 Virada Oficial para Produção', start: d(28), end: d(28), duration: 0, progress: 0, pred: '10', resourceId: 1, type: 'milestone', parentId: 9 }
                ];
                this.saveState();
            }

            setupEventListeners() {
                // Ribbon Tabs
                document.querySelectorAll('.ribbon-tab-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.ribbon-tab-btn').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.ribbon-content').forEach(c => c.classList.remove('active'));
                        btn.classList.add('active');
                        const target = document.getElementById(btn.dataset.tab);
                        if (target) target.classList.add('active');
                    });
                });

                // Task Insertion
                document.getElementById('btnAddTask').addEventListener('click', () => this.addTask('task'));
                document.getElementById('btnAddSubtask').addEventListener('click', () => this.addTask('subtask'));
                document.getElementById('btnAddMilestone').addEventListener('click', () => this.addTask('milestone'));
                document.getElementById('btnDeleteTask').addEventListener('click', () => this.deleteSelectedTask());
                document.getElementById('btnIndent').addEventListener('click', () => this.indentTask());
                document.getElementById('btnOutdent').addEventListener('click', () => this.outdentTask());

                // Quick percentage buttons
                document.querySelectorAll('.pct-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (this.selectedTaskId) {
                            const task = this.tasks.find(t => t.id === this.selectedTaskId);
                            if (task) {
                                task.progress = parseInt(btn.dataset.pct);
                                this.saveState();
                                this.render();
                            }
                        }
                    });
                });

                // View Modes
                document.getElementById('btnViewGantt').addEventListener('click', () => this.switchView('gantt'));
                document.getElementById('btnViewKanban').addEventListener('click', () => this.switchView('kanban'));
                document.getElementById('btnViewResources').addEventListener('click', () => this.switchView('resources'));
                document.getElementById('btnResourceSheet').addEventListener('click', () => this.switchView('resources'));

                // Zoom Buttons
                document.getElementById('btnZoomIn').addEventListener('click', () => this.setZoom('day', 48));
                document.getElementById('btnZoomFit').addEventListener('click', () => this.setZoom('week', 24));
                document.getElementById('btnZoomOut').addEventListener('click', () => this.setZoom('month', 12));
                document.getElementById('btnToday').addEventListener('click', () => this.scrollToToday());

                // Baseline & Critical Path
                document.getElementById('btnSetBaseline').addEventListener('click', () => {
                    this.tasks.forEach(t => {
                        t.baselineStart = t.start;
                        t.baselineEnd = t.end;
                    });
                    this.saveState();
                    this.render();
                    alert('Linha de Base (Baseline) gravada com sucesso!');
                });

                document.getElementById('btnToggleCritical').addEventListener('click', () => {
                    this.showCriticalPath = !this.showCriticalPath;
                    document.getElementById('btnToggleCritical').classList.toggle('active', this.showCriticalPath);
                    this.render();
                });

                // Save, Open & Exports
                document.getElementById('btnQuickSave').addEventListener('click', () => this.saveToStorage(true));
                document.getElementById('btnSaveFile').addEventListener('click', () => this.exportJSON());
                document.getElementById('btnLoadFile').addEventListener('click', () => document.getElementById('fileInput').click());
                document.getElementById('fileInput').addEventListener('change', (e) => this.importJSON(e));
                document.getElementById('btnExportExcel').addEventListener('click', () => this.exportExcel());
                document.getElementById('btnExportPDF').addEventListener('click', () => window.print());
                document.getElementById('btnQuickPrint').addEventListener('click', () => window.print());
                document.getElementById('btnNewProject').addEventListener('click', () => {
                    if (confirm('Deseja criar um novo projeto? As alterações salvas localmente serão substituídas.')) {
                        this.tasks = [];
                        this.loadSampleProject();
                        this.render();
                    }
                });

                // Theme Toggle
                document.getElementById('btnThemeToggle').addEventListener('click', () => this.toggleTheme());

                // Splitter Dragging
                this.setupSplitter();

                // Search Filter
                document.getElementById('taskSearchInput').addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderTaskList();
                });
            }

            switchView(view) {
                document.getElementById('btnViewGantt').classList.toggle('active', view === 'gantt');
                document.getElementById('btnViewKanban').classList.toggle('active', view === 'kanban');
                document.getElementById('btnViewResources').classList.toggle('active', view === 'resources');

                document.getElementById('ganttViewContainer').style.display = view === 'gantt' ? 'flex' : 'none';
                document.getElementById('kanbanViewContainer').style.display = view === 'kanban' ? 'flex' : 'none';
                document.getElementById('resourcesViewContainer').style.display = view === 'resources' ? 'block' : 'none';

                if (view === 'kanban') this.renderKanban();
                if (view === 'resources') this.renderResources();
            }

            setZoom(level, width) {
                this.zoomLevel = level;
                this.cellWidth = width;
                this.render();
            }

            toggleTheme() {
                const html = document.documentElement;
                const isDark = html.getAttribute('data-theme') === 'dark';
                const nextTheme = isDark ? 'light' : 'dark';
                html.setAttribute('data-theme', nextTheme);
                localStorage.setItem('project_theme', nextTheme);
                
                const btn = document.getElementById('btnThemeToggle');
                btn.innerHTML = nextTheme === 'dark' 
                    ? '<i class="fas fa-moon"></i> <span>Tema Escuro</span>'
                    : '<i class="fas fa-sun"></i> <span>Tema Claro</span>';
            }

            updateDynamicYear() {
                const year = new Date().getFullYear();
                const el = document.getElementById('year');
                if (el) el.textContent = year;
            }

            render() {
                this.calculateDates();
                this.renderKPIs();
                this.renderTaskList();
                this.renderTimelineHeader();
                this.renderGanttBars();
            }

            calculateDates() {
                this.tasks.forEach(t => {
                    if (t.type === 'summary') {
                        const children = this.tasks.filter(c => c.parentId === t.id);
                        if (children.length > 0) {
                            const starts = children.map(c => new Date(c.start)).filter(d => !isNaN(d));
                            const ends = children.map(c => new Date(c.end)).filter(d => !isNaN(d));
                            if (starts.length > 0) {
                                t.start = new Date(Math.min(...starts)).toISOString().split('T')[0];
                                t.end = new Date(Math.max(...ends)).toISOString().split('T')[0];
                                const totalDur = children.reduce((acc, c) => acc + (c.duration || 1), 0);
                                const weightedProg = children.reduce((acc, c) => acc + ((c.progress || 0) * (c.duration || 1)), 0);
                                t.progress = totalDur > 0 ? Math.round(weightedProg / totalDur) : 0;
                            }
                        }
                    }
                });
            }

            renderKPIs() {
                const total = this.tasks.length;
                if (total === 0) return;

                const avgProg = Math.round(this.tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / total);
                document.getElementById('kpiProgress').textContent = `${avgProg}%`;

                const totalCost = this.tasks.reduce((acc, t) => {
                    const res = this.resources.find(r => r.id === t.resourceId);
                    const rate = res ? res.rate : 80;
                    return acc + (t.duration * 8 * rate);
                }, 0);
                document.getElementById('kpiCost').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost);

                const criticalCount = this.tasks.filter(t => t.duration > 4 && t.progress < 50).length;
                document.getElementById('kpiCritical').textContent = criticalCount;
                document.getElementById('kpiResources').textContent = `${this.resources.length} membros`;
            }

            renderTaskList() {
                const container = document.getElementById('taskListScroll');
                container.innerHTML = '';

                this.tasks.forEach(task => {
                    if (this.searchTerm && !task.name.toLowerCase().includes(this.searchTerm)) return;

                    const row = document.createElement('div');
                    row.className = `task-row ${this.selectedTaskId === task.id ? 'selected' : ''}`;
                    if (this.showCriticalPath && task.duration > 4 && task.progress < 50) {
                        row.classList.add('critical');
                    }

                    const indentPx = task.parentId ? 20 : 4;
                    const iconClass = task.type === 'summary' ? 'fa-folder summary' : (task.type === 'milestone' ? 'fa-flag-checkered milestone' : 'fa-list-check');

                    row.innerHTML = `
                        <div class="task-cell col-id">${task.id}</div>
                        <div class="task-cell col-name" style="padding-left: ${indentPx}px;">
                            <div class="task-cell-name">
                                <i class="fas ${iconClass} task-type-icon ${task.type}"></i>
                                <span style="font-weight: ${task.type === 'summary' ? '700' : '500'};">${task.name}</span>
                            </div>
                        </div>
                        <div class="task-cell col-dur">${task.duration}d</div>
                        <div class="task-cell col-start">${this.formatDateBR(task.start)}</div>
                        <div class="task-cell col-end">${this.formatDateBR(task.end)}</div>
                        <div class="task-cell col-pred">${task.pred || '-'}</div>
                        <div class="task-cell col-pct">${task.progress}%</div>
                    `;

                    row.addEventListener('click', () => {
                        this.selectedTaskId = task.id;
                        this.renderTaskList();
                    });

                    row.addEventListener('dblclick', () => this.openTaskModal(task));

                    container.appendChild(row);
                });
            }

            renderTimelineHeader() {
                const header = document.getElementById('timelineHeader');
                header.innerHTML = '';

                const minDate = this.getMinDate();
                const maxDate = this.getMaxDate();
                const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 10;

                const row1 = document.createElement('div');
                row1.className = 'timeline-scale-primary';

                const row2 = document.createElement('div');
                row2.className = 'timeline-scale-secondary';

                for (let i = 0; i < totalDays; i++) {
                    const current = new Date(minDate);
                    current.setDate(minDate.getDate() + i);

                    const cell = document.createElement('div');
                    cell.className = 'timeline-cell';
                    cell.style.width = `${this.cellWidth}px`;
                    
                    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
                    const isToday = current.toDateString() === new Date().toDateString();

                    if (isWeekend) cell.classList.add('weekend');
                    if (isToday) cell.classList.add('today');

                    cell.textContent = current.getDate();
                    row2.appendChild(cell);
                }

                header.appendChild(row1);
                header.appendChild(row2);
            }

            renderGanttBars() {
                const bgLayer = document.getElementById('ganttGridBackground');
                const rowsLayer = document.getElementById('ganttRowsLayer');
                const svgLayer = document.getElementById('ganttSvgLayer');

                bgLayer.innerHTML = '';
                rowsLayer.innerHTML = '';
                svgLayer.innerHTML = '';

                const minDate = this.getMinDate();
                const maxDate = this.getMaxDate();
                const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 10;

                // Background grid columns
                for (let i = 0; i < totalDays; i++) {
                    const current = new Date(minDate);
                    current.setDate(minDate.getDate() + i);
                    const col = document.createElement('div');
                    col.className = 'gantt-grid-col';
                    col.style.width = `${this.cellWidth}px`;
                    if (current.getDay() === 0 || current.getDay() === 6) col.classList.add('weekend');
                    if (current.toDateString() === new Date().toDateString()) col.classList.add('today');
                    bgLayer.appendChild(col);
                }

                // Bars and rows
                this.tasks.forEach((task, index) => {
                    const row = document.createElement('div');
                    row.className = 'gantt-bar-row';

                    const taskStart = new Date(task.start);
                    const taskEnd = new Date(task.end);
                    const offsetDays = Math.max(0, Math.ceil((taskStart - minDate) / (1000 * 60 * 60 * 24)));
                    const durDays = Math.max(1, Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);

                    const leftPx = offsetDays * this.cellWidth;
                    const widthPx = durDays * this.cellWidth;

                    const bar = document.createElement('div');
                    bar.className = `gantt-bar ${task.type}`;
                    if (this.showCriticalPath && task.duration > 4 && task.progress < 50) {
                        bar.classList.add('critical');
                    }
                    bar.style.left = `${leftPx}px`;
                    bar.style.width = `${widthPx}px`;
                    bar.dataset.taskId = task.id;

                    if (task.color && task.type === 'task') {
                        bar.style.backgroundColor = task.color;
                    }

                    // Progress Fill
                    if (task.type !== 'milestone') {
                        const fill = document.createElement('div');
                        fill.className = 'gantt-bar-progress-fill';
                        fill.style.width = `${task.progress}%`;
                        bar.appendChild(fill);
                    }

                    // Label
                    const label = document.createElement('div');
                    label.className = 'gantt-bar-label';
                    label.textContent = `${task.name} (${task.progress}%)`;
                    bar.appendChild(label);

                    // Baseline Bar
                    if (task.baselineStart && task.baselineEnd) {
                        const bStart = new Date(task.baselineStart);
                        const bEnd = new Date(task.baselineEnd);
                        const bOffset = Math.ceil((bStart - minDate) / (1000 * 60 * 60 * 24));
                        const bDur = Math.ceil((bEnd - bStart) / (1000 * 60 * 60 * 24)) + 1;

                        const baselineBar = document.createElement('div');
                        baselineBar.className = 'gantt-bar-baseline';
                        baselineBar.style.left = `${bOffset * this.cellWidth}px`;
                        baselineBar.style.width = `${bDur * this.cellWidth}px`;
                        row.appendChild(baselineBar);
                    }

                    bar.addEventListener('click', () => {
                        this.selectedTaskId = task.id;
                        this.renderTaskList();
                    });
                    bar.addEventListener('dblclick', () => this.openTaskModal(task));

                    row.appendChild(bar);
                    rowsLayer.appendChild(row);
                });

                // Sync height & width
                const totalWidth = totalDays * this.cellWidth;
                bgLayer.style.width = `${totalWidth}px`;
                rowsLayer.style.width = `${totalWidth}px`;
                svgLayer.setAttribute('width', totalWidth);
                svgLayer.setAttribute('height', this.tasks.length * 38);
            }

            renderKanban() {
                const todoList = document.getElementById('kanbanListTodo');
                const progList = document.getElementById('kanbanListInProgress');
                const revList = document.getElementById('kanbanListReview');
                const doneList = document.getElementById('kanbanListDone');

                todoList.innerHTML = '';
                progList.innerHTML = '';
                revList.innerHTML = '';
                doneList.innerHTML = '';

                let countTodo = 0, countProg = 0, countRev = 0, countDone = 0;

                this.tasks.forEach(task => {
                    const card = document.createElement('div');
                    card.className = 'kanban-card';
                    card.innerHTML = `
                        <div class="kanban-card-title">${task.name}</div>
                        <div class="kanban-card-progress">
                            <div class="kanban-card-progress-bar" style="width: ${task.progress}%;"></div>
                        </div>
                        <div class="kanban-card-meta">
                            <span><i class="fas fa-calendar"></i> ${task.duration} dias</span>
                            <span><strong>${task.progress}%</strong></span>
                        </div>
                    `;
                    card.addEventListener('dblclick', () => this.openTaskModal(task));

                    if (task.progress === 100) {
                        doneList.appendChild(card);
                        countDone++;
                    } else if (task.progress >= 75) {
                        revList.appendChild(card);
                        countRev++;
                    } else if (task.progress > 0) {
                        progList.appendChild(card);
                        countProg++;
                    } else {
                        todoList.appendChild(card);
                        countTodo++;
                    }
                });

                document.getElementById('badgeTodo').textContent = countTodo;
                document.getElementById('badgeInProgress').textContent = countProg;
                document.getElementById('badgeReview').textContent = countRev;
                document.getElementById('badgeDone').textContent = countDone;
            }

            renderResources() {
                const tbody = document.getElementById('resourcesTableBody');
                tbody.innerHTML = '';

                this.resources.forEach((res, index) => {
                    const tasksAssigned = this.tasks.filter(t => t.resourceId === res.id);
                    const totalHours = tasksAssigned.reduce((acc, t) => acc + (t.duration * 8), 0);
                    const totalCost = totalHours * res.rate;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td><strong>${res.name}</strong></td>
                        <td><span style="color:#10b981; font-weight:600;">${res.role}</span></td>
                        <td>R$ ${res.rate.toFixed(2)}/h</td>
                        <td>${tasksAssigned.length} tarefas</td>
                        <td>${totalHours} horas</td>
                        <td><strong>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}</strong></td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            openTaskModal(task) {
                document.getElementById('modalTaskName').value = task.name;
                document.getElementById('modalTaskStart').value = task.start;
                document.getElementById('modalTaskEnd').value = task.end;
                document.getElementById('modalTaskDuration').value = task.duration;
                document.getElementById('modalTaskProgress').value = task.progress;
                document.getElementById('modalTaskPred').value = task.pred || '';
                document.getElementById('modalTaskType').value = task.type || 'task';
                document.getElementById('modalTaskColor').value = task.color || '#107c41';

                const resSelect = document.getElementById('modalTaskResource');
                resSelect.innerHTML = '<option value="">(Nenhum)</option>';
                this.resources.forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r.id;
                    opt.textContent = `${r.name} (${r.role})`;
                    if (task.resourceId === r.id) opt.selected = true;
                    resSelect.appendChild(opt);
                });

                document.getElementById('btnSaveTaskModal').onclick = () => {
                    task.name = document.getElementById('modalTaskName').value;
                    task.start = document.getElementById('modalTaskStart').value;
                    task.end = document.getElementById('modalTaskEnd').value;
                    task.duration = parseInt(document.getElementById('modalTaskDuration').value) || 1;
                    task.progress = parseInt(document.getElementById('modalTaskProgress').value) || 0;
                    task.pred = document.getElementById('modalTaskPred').value;
                    task.type = document.getElementById('modalTaskType').value;
                    task.color = document.getElementById('modalTaskColor').value;
                    task.resourceId = parseInt(document.getElementById('modalTaskResource').value) || null;

                    this.saveState();
                    this.render();
                    closeModal('taskModal');
                };

                document.getElementById('taskModal').classList.add('active');
            }

            addTask(type = 'task') {
                const nextId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
                const today = new Date().toISOString().split('T')[0];
                const newTask = {
                    id: nextId,
                    name: type === 'milestone' ? 'Novo Marco de Entrega' : (type === 'subtask' ? 'Nova Subtarefa' : 'Nova Tarefa'),
                    start: today,
                    end: today,
                    duration: type === 'milestone' ? 0 : 3,
                    progress: 0,
                    pred: '',
                    type: type === 'subtask' ? 'task' : type,
                    parentId: type === 'subtask' && this.selectedTaskId ? this.selectedTaskId : null
                };
                this.tasks.push(newTask);
                this.selectedTaskId = nextId;
                this.saveState();
                this.render();
            }

            deleteSelectedTask() {
                if (!this.selectedTaskId) return;
                this.tasks = this.tasks.filter(t => t.id !== this.selectedTaskId && t.parentId !== this.selectedTaskId);
                this.selectedTaskId = null;
                this.saveState();
                this.render();
            }

            indentTask() {
                if (!this.selectedTaskId) return;
                const idx = this.tasks.findIndex(t => t.id === this.selectedTaskId);
                if (idx > 0) {
                    this.tasks[idx].parentId = this.tasks[idx - 1].id;
                    this.saveState();
                    this.render();
                }
            }

            outdentTask() {
                if (!this.selectedTaskId) return;
                const task = this.tasks.find(t => t.id === this.selectedTaskId);
                if (task && task.parentId) {
                    task.parentId = null;
                    this.saveState();
                    this.render();
                }
            }

            getMinDate() {
                const dates = this.tasks.map(t => new Date(t.start)).filter(d => !isNaN(d));
                return dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
            }

            getMaxDate() {
                const dates = this.tasks.map(t => new Date(t.end)).filter(d => !isNaN(d));
                return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
            }

            formatDateBR(dateStr) {
                if (!dateStr) return '-';
                const parts = dateStr.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
            }

            scrollToToday() {
                const todayCol = document.querySelector('.gantt-grid-col.today');
                if (todayCol) {
                    todayCol.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                }
            }

            setupSplitter() {
                const splitter = document.getElementById('workspaceSplitter');
                const leftPanel = document.getElementById('taskListPanel');
                let isDragging = false;

                splitter.addEventListener('mousedown', () => {
                    isDragging = true;
                    splitter.classList.add('dragging');
                    document.body.style.cursor = 'col-resize';
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    const newWidth = Math.max(300, Math.min(800, e.clientX));
                    leftPanel.style.width = `${newWidth}px`;
                });

                document.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        splitter.classList.remove('dragging');
                        document.body.style.cursor = 'default';
                    }
                });
            }

            saveState() {
                this.saveToStorage();
            }

            saveToStorage(notify = false) {
                localStorage.setItem('project_tasks', JSON.stringify(this.tasks));
                localStorage.setItem('project_resources', JSON.stringify(this.resources));
                localStorage.setItem('project_title', document.getElementById('projectTitle').value);
                if (notify) alert('Projeto salvo no navegador com sucesso!');
            }

            loadFromStorage() {
                const saved = localStorage.getItem('project_tasks');
                if (saved) {
                    try { this.tasks = JSON.parse(saved); } catch(e) {}
                }
                const savedRes = localStorage.getItem('project_resources');
                if (savedRes) {
                    try { this.resources = JSON.parse(savedRes); } catch(e) {}
                }
                const savedTitle = localStorage.getItem('project_title');
                if (savedTitle) {
                    document.getElementById('projectTitle').value = savedTitle;
                }
                const savedTheme = localStorage.getItem('project_theme');
                if (savedTheme) {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                }
            }

            exportJSON() {
                const data = {
                    title: document.getElementById('projectTitle').value,
                    tasks: this.tasks,
                    resources: this.resources,
                    exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${document.getElementById('projectTitle').value.replace(/\s+/g, '_')}.json`;
                a.click();
            }

            importJSON(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.tasks) this.tasks = data.tasks;
                        if (data.resources) this.resources = data.resources;
                        if (data.title) document.getElementById('projectTitle').value = data.title;
                        this.saveState();
                        this.render();
                        alert('Projeto importado com sucesso!');
                    } catch(err) {
                        alert('Erro ao carregar arquivo de projeto.');
                    }
                };
                reader.readAsText(file);
            }

            exportExcel() {
                if (typeof XLSX === 'undefined') {
                    alert('Biblioteca XLSX carregando, tente novamente em alguns instantes.');
                    return;
                }
                const rows = this.tasks.map(t => ({
                    'ID': t.id,
                    'Nome da Tarefa': t.name,
                    'Tipo': t.type,
                    'Início': t.start,
                    'Término': t.end,
                    'Duração (Dias)': t.duration,
                    '% Concluído': t.progress,
                    'Predecessoras': t.pred || '',
                    'Responsável': (this.resources.find(r => r.id === t.resourceId) || {}).name || ''
                }));

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
                XLSX.writeFile(wb, `${document.getElementById('projectTitle').value}.xlsx`);
            }
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Global Initialization
        window.addEventListener('DOMContentLoaded', () => {
            window.app = new ProjectApp();
        });
    </script>
</body>
</html>
