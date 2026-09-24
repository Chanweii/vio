/**
 * VIO Hero Background Animation
 * Pure 2D Front Elevation — Flat Technical Drawing
 * Style: clean line art, no 3D, no shading, uniform strokes (Processing / OpenCV aesthetic)
 */

class IsolationSystemAnimation {

    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isPlaying = false;
        this.startTime = null;
        this.pauseTime = null;
        this.duration = 7500;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
    }

    // ─── Lifecycle ────────────────────────────────────────────────

    init() {
        const io = new IntersectionObserver(entries =>
            entries.forEach(e => e.isIntersecting ? this.play() : this.pause())
        );
        io.observe(this.canvas);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pause();
            else if (this.canvas.getBoundingClientRect().top < window.innerHeight) this.play();
        });
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
            this.isReducedMotion = e.matches;
            if (e.matches) { this.pause(); this.drawFrame(0, 0, 0); }
            else this.play();
        });
        this.watchTheme();
    }

    play() {
        if (this.isPlaying || this.isReducedMotion) return;
        this.isPlaying = true;
        if (!this.startTime) this.startTime = Date.now();
        else if (this.pauseTime) {
            this.startTime += Date.now() - this.pauseTime;
            this.pauseTime = null;
        }
        this.render();
    }

    pause() {
        this.isPlaying = false;
        this.pauseTime = Date.now();
    }

    // ─── Canvas setup ─────────────────────────────────────────────

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.cssW = rect.width;
        this.cssH = rect.height;
        this.canvas.width  = rect.width  * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        // Scale: design space is 900w × 650h world units
        this.s  = Math.min(this.cssW / 900, this.cssH / 650);
        // Origin: x-centre, z=0 is at 75% down from top
        this.ox = this.cssW * 0.50;
        this.oy = this.cssH * 0.75;

        // Halftone Setup
        this.dotSpacing = 10; // CSS pixels between dots
        this.cols = Math.ceil(this.cssW / this.dotSpacing);
        this.rows = Math.ceil(this.cssH / this.dotSpacing);
        
        if (!this.offCanvas) {
            this.offCanvas = document.createElement('canvas');
            this.offCtx = this.offCanvas.getContext('2d', { willReadFrequently: true });
        }
        this.offCanvas.width = this.cols;
        this.offCanvas.height = this.rows;

        if (!this.isPlaying) this.drawFrame(0, 0, 0);
    }

    // World (x, z) → screen [sx, sy].  z+ = up, z− = down.
    w(x, z) {
        return [
            this.ox + x * this.s,
            this.oy - z * this.s
        ];
    }

    // ─── Colours ──────────────────────────────────────────────────

    isDark() {
        // Respect the site's manual toggle (data-theme) first; fall back to OS
        const theme = document.documentElement.dataset.theme
            || document.documentElement.getAttribute('data-theme')
            || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        return theme === 'dark';
    }

    C() {
        const dark = this.isDark();
        return {
            bg:      dark ? '#0f0f0f' : '#F0F0F0',
            dotBase: dark ? '#2A2A2A' : '#D5D5D5',
            ground:  dark ? '#4B79FF' : '#1E3ECC',
            upper:   dark ? '#FFFFFF' : '#111111',
        };
    }

    // Watch for theme changes triggered by the site's toggle button
    watchTheme() {
        const obs = new MutationObserver(() => {
            if (!this.isPlaying) this.drawFrame(0, 0, 0);
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    }
    // ─── Drawing primitives (Offscreen Solid Masking) ─────────────

    box(ctx, x1, z1, x2, z2, color) {
        const [lx, ly] = this.w(x1, Math.min(z1, z2));
        const [rx, ry] = this.w(x2, Math.max(z1, z2));
        ctx.fillStyle = color;
        ctx.fillRect(lx, ry, rx - lx, ly - ry);
    }

    circ(ctx, cx, cz, r, color) {
        const [x, y] = this.w(cx, cz);
        const R = r * this.s;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawGear(ctx, cx, cz, ro, rm, ri, angle, color) {
        const [x, y] = this.w(cx, cz);
        const Ro = ro * this.s;
        const Rm = rm * this.s;
        const Ri = ri * this.s;
        const teeth = 16;
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const a = angle + (i * Math.PI) / teeth;
            const rBase = i % 2 === 0 ? Ro : Rm;
            const px = x + Math.cos(a) * rBase;
            const py = y - Math.sin(a) * rBase;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.arc(x, y, Ri, 0, Math.PI * 2, true);
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawRack(ctx, x1, x2, zTop, zBot, zTeeth, teethCount, color) {
        const [lx, lyTop] = this.w(x1, zTop);
        const [rx, lyBot] = this.w(x2, zBot);
        const [ , lyTeeth] = this.w(0, zTeeth);
        
        ctx.beginPath();
        ctx.moveTo(lx, lyTop);
        ctx.lineTo(rx, lyTop);
        ctx.lineTo(rx, lyBot);
        
        const dx = (rx - lx) / (teethCount * 2);
        for (let i = teethCount * 2; i >= 0; i--) {
            const px = lx + i * dx;
            const pz = i % 2 === 0 ? lyBot : lyTeeth;
            ctx.lineTo(px, pz);
        }
        ctx.lineTo(lx, lyBot);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }



    // ─── Physics ──────────────────────────────────────────────────

    physics(elapsed) {
        let gX = 0, rel = 0;
        if (elapsed < 1500) {
            // static
        } else if (elapsed < 2000) {
            const t = (elapsed - 1500) / 500;
            const ease = -(Math.cos(Math.PI * t) - 1) / 2;
            gX  = -100 * Math.sin(ease * Math.PI);
            rel =   65 * ease;
        } else {
            const t = (elapsed - 2000) / 5500;
            gX  = 38 * Math.sin(t * Math.PI * 8)  * Math.pow(Math.max(0, 1 - t * 4.0), 3);
            rel = 65 * Math.cos(t * Math.PI * 3) * Math.pow(Math.max(0, 1 - t * 1.5), 2);
        }
        // Isolation: upper plate moves very little compared to ground
        const upperX   = rel * 0.12;
        // Gear rotates as rack slides under it
        const gearAngle = -gX / 26;
        return { groundX: gX, upperX, gearAngle };
    }

    // ─── Main draw ────────────────────────────────────────────────

    drawFrame(groundX, upperX, gearAngle) {
        const ctx = this.ctx;
        const c   = this.C();
        const s   = this.s;

        ctx.clearRect(0, 0, this.cssW, this.cssH);
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';

        // ══════════════════════════════════════════════════════════
        // OFFSCREEN RENDERING (Solid Masks)
        // ══════════════════════════════════════════════════════════
        const octx = this.offCtx;
        octx.clearRect(0, 0, this.cols, this.rows);
        octx.save();
        // Scale offscreen context so CSS pixels map to grid matrix
        octx.scale(1 / this.dotSpacing, 1 / this.dotSpacing);

        // Color coding for masking: Red=Ground, Green=Upper
        const COL_GROUND = '#FF0000';
        const COL_UPPER  = '#00FF00';

        const shift = (dx, drawFn) => {
            octx.save();
            octx.translate(dx * this.s, 0);
            drawFn();
            octx.restore();
        };

        const Z = {
            gearCen:   -46,
            teethTip:  -30,
            rackBot:   -16,
            rackTop:     0,
            rolCen:    +16, rolR: 16,
            brktBot:   +32,
            brktTop:   +52,
            capBot:    +56,
            capTop:    +72,
            upBot:     +76,
            upTop:     +110,
            eqBot:     +110,
            eqTop:     +250,
        };

        // Render solid blocks to offscreen canvas
        shift(groundX, () => {
            this.drawRack(octx, -280, 280, Z.rackTop, Z.rackBot, Z.teethTip, 46, COL_GROUND);
            this.box(octx, -260, Z.brktBot, 260, Z.brktTop, COL_GROUND);
            this.circ(octx, -150, Z.rolCen, Z.rolR, COL_GROUND);
            this.circ(octx, +150, Z.rolCen, Z.rolR, COL_GROUND);
            
            this.drawGear(octx, 0, Z.gearCen, 22, 14, 14, gearAngle || 0, COL_GROUND);
            this.box(octx, -50, Z.rackTop, 50, +24, COL_GROUND);
            this.box(octx, -14, +24, 14, Z.capBot, COL_GROUND);
            this.box(octx, -60, Z.capBot, 60, Z.capTop, COL_GROUND);
        });

        shift(upperX, () => {
            this.box(octx, -260, Z.upBot, 260, Z.upTop, COL_UPPER);
            this.box(octx, -210, Z.eqBot, 210, Z.eqTop, COL_UPPER);
        });

        octx.restore();

        // ══════════════════════════════════════════════════════════
        // HALFTONE RENDERING (Dot Matrix to Main Canvas)
        // ══════════════════════════════════════════════════════════
        const imgData = octx.getImageData(0, 0, this.cols, this.rows).data;

        this.ctx.clearRect(0, 0, this.cssW, this.cssH);

        const rMax = this.dotSpacing * 0.45; // Max dot radius
        const rBase = this.dotSpacing * 0.08; // Background dot radius
        
        const dots = {
            base: [],
            ground: [],
            upper: []
        };

        // Sample pixels and sort into color groups
        for (let r = 0; r < this.rows; r++) {
            for (let cCol = 0; cCol < this.cols; cCol++) {
                const i = (r * this.cols + cCol) * 4;
                const red = imgData[i];
                const green = imgData[i + 1];
                const blue = imgData[i + 2];
                
                const cx = cCol * this.dotSpacing + this.dotSpacing * 0.5;
                const cy = r * this.dotSpacing + this.dotSpacing * 0.5;

                if (green > 5) {
                    dots.upper.push({ cx, cy, rad: (green / 255) * rMax });
                } else if (red > 5) {
                    dots.ground.push({ cx, cy, rad: (red / 255) * rMax });
                } else {
                    dots.base.push({ cx, cy, rad: rBase });
                }
            }
        }

        // Fast grouped draw function
        const drawGroup = (group, fillStyle) => {
            if (group.length === 0) return;
            this.ctx.fillStyle = fillStyle;
            this.ctx.beginPath();
            for (let i = 0; i < group.length; i++) {
                const p = group[i];
                this.ctx.moveTo(p.cx + p.rad, p.cy);
                this.ctx.arc(p.cx, p.cy, p.rad, 0, Math.PI * 2);
            }
            this.ctx.fill();
        };

        drawGroup(dots.base, c.dotBase);
        drawGroup(dots.ground, c.ground);
        drawGroup(dots.upper, c.upper);
    }

    // ─── Animation loop ───────────────────────────────────────────

    render() {
        if (!this.isPlaying) return;
        
        const cycleDuration = this.duration * 2;
        const totalElapsed = (Date.now() - this.startTime) % cycleDuration;
        
        let elapsed = totalElapsed;
        if (totalElapsed > this.duration) {
            elapsed = cycleDuration - totalElapsed;
        }
        
        const { groundX, upperX, gearAngle } = this.physics(elapsed);
        this.drawFrame(groundX, upperX, gearAngle);
        requestAnimationFrame(() => this.render());
    }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('astro:page-load', () => {
    new IsolationSystemAnimation();
});


