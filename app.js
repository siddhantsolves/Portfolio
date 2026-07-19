// --- REGISTER GSAP PLUGINS ---
gsap.registerPlugin(ScrollTrigger);

// --- STEP 1: Aligned Coordinates Map for 3D Car Model ---
const arrPositionModel = [
    { id: 'home', position: { x: 1.5, y: -0.5, z: 0 }, rotation: { x: 0, y: -0.8, z: 0 }, animation: 'AllActions' },
    { id: 'intro', position: { x: 0, y: -1.1, z: 1.2 }, rotation: { x: 0.05, y: 0, z: 0 }, animation: 'AllActions' }, 
    { id: 'my-story', position: { x: 1.4, y: -0.84, z: 3 }, rotation: { x: 0.12, y: -2.8, z: 0.03 }, animation: 'LeftDoorAction' }, 
    { id: 'why-i-build', position: { x: 1.4, y: -0.45, z: 3 }, rotation: { x: 0.15, y: -1, z: 0.03 }, animation: 'RearDoorAction' },  
    { id: 'how-i-think', position: { x: 2.2, y: -0.55, z: 1.8 }, rotation: { x: 0.08, y: -0.4, z: 0 }, animation: 'FrontDoorWindshieldAction' },
    { id: 'where-headed', position: { x: 2.2, y: -0.65, z: 1.4 }, rotation: { x: 0.08, y: -3, z: 0 }, animation: 'AllActions' },
    { id: 'skills', position: { x: 1.5, y: -0.5, z: -3 }, rotation: { x: -0.1, y: -1.0, z: -0.1 }, animation: 'AllActions' }
];

// --- STEP 1.5: Isolated WebGL Loader Screen Loop ---
let loaderAnimationId;
let loaderRenderer, loaderScene, loaderCamera, loaderMesh, loaderMeshOuter;

function initLoaderWebGL() {
    const canvas = document.getElementById('loader-canvas');
    if (!canvas) return;

    loaderScene = new THREE.Scene();
    loaderCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    loaderCamera.position.z = 7;

    loaderRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    loaderRenderer.setSize(window.innerWidth, window.innerHeight);
    loaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dynamic core geometry mapping color themes from the portfolio details
    const geometry = new THREE.TorusKnotGeometry(0.9, 0.22, 100, 16);
    
    const materialInner = new THREE.MeshBasicMaterial({
        color: 0xff0d19,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    loaderMesh = new THREE.Mesh(geometry, materialInner);
    loaderScene.add(loaderMesh);

    const materialOuter = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    loaderMeshOuter = new THREE.Mesh(geometry, materialOuter);
    loaderMeshOuter.scale.set(1.08, 1.08, 1.08);
    loaderScene.add(loaderMeshOuter);

    function animateLoader() {
        loaderAnimationId = requestAnimationFrame(animateLoader);
        if (loaderMesh) {
            loaderMesh.rotation.x += 0.003;
            loaderMesh.rotation.y += 0.006;
        }
        if (loaderMeshOuter) {
            loaderMeshOuter.rotation.x -= 0.002;
            loaderMeshOuter.rotation.y -= 0.004;
        }
        loaderRenderer.render(loaderScene, loaderCamera);
    }
    animateLoader();

    window.addEventListener('resize', onLoaderResize);
}

function onLoaderResize() {
    if (!loaderRenderer || !loaderCamera) return;
    loaderCamera.aspect = window.innerWidth / window.innerHeight;
    loaderCamera.updateProjectionMatrix();
    loaderRenderer.setSize(window.innerWidth, window.innerHeight);
}

function updateLoaderProgress(percent) {
    const rounded = Math.round(percent);
    gsap.to('.loader-progress-bar', { width: `${rounded}%`, duration: 0.2 });
    const percentageEl = document.querySelector('.loader-percentage');
    if (percentageEl) {
        percentageEl.textContent = `${rounded}%`;
    }
    
    if (rounded >= 100) {
        hideLoadingScreen();
    }
}

let isLoaderRemoved = false;
function hideLoadingScreen() {
    if (isLoaderRemoved) return;
    isLoaderRemoved = true;

    const tl = gsap.timeline({
        onComplete: () => {
            const screen = document.getElementById('loading-screen');
            if (screen) screen.remove();
            
            // Clean up and release system memory instantly
            window.removeEventListener('resize', onLoaderResize);
            cancelAnimationFrame(loaderAnimationId);
            if (loaderMesh) {
                loaderMesh.geometry.dispose();
                loaderMesh.material.dispose();
            }
            if (loaderMeshOuter) {
                loaderMeshOuter.geometry.dispose();
                loaderMeshOuter.material.dispose();
            }
            if (loaderRenderer) {
                loaderRenderer.dispose();
            }
            loaderScene = null;
            loaderCamera = null;
            loaderRenderer = null;
        }
    });

    // Clean exit sequence
    tl.to('.loader-content', { opacity: 0, y: -25, duration: 0.5, ease: "power2.in" });
    tl.to('#loader-canvas', { opacity: 0, duration: 0.5 }, "-=0.3");
    tl.to('#loading-screen', { opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.2");
}

function animateLoaderRules() {
    const tl = gsap.timeline();
    tl.to('.loader-rules-container', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.2
    });
    tl.to('.rule-item', {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.4,
        ease: "power2.out"
    }, "-=0.4");
}

// --- STEP 2: Three.js Configuration ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15; 

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('container3D').appendChild(renderer.domElement);

const carGroup = new THREE.Group();
scene.add(carGroup);

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// --- STEP 3: Object-Pooled Neon Lightning Trail System ---
const numLightning = 20;
const lightningPool = [];
let activeLightningIndex = 0;
const lightningSegments = 5; // 5 connected points per electric arc bolt

// Pre-create line segments in the scene to avoid performance drops during acceleration
for (let i = 0; i < numLightning; i++) {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(lightningSegments * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.LineBasicMaterial({
        color: 0xff0d19,
        transparent: true,
        opacity: 1.0,
        linewidth: 2
    });
    
    const line = new THREE.Line(geom, mat);
    line.visible = false;
    scene.add(line);
    lightningPool.push(line);
}

let isAccelerating = false;
let isRendererRunning = true;
let loopTimeoutId = null;

// Sets up a jagged fanning arc extending opposite to the direction of travel
function spawnLightningBolt(startPoint, dirVec) {
    const line = lightningPool[activeLightningIndex];
    const posAttr = line.geometry.attributes.position;
    const positions = posAttr.array;
    
    let currentPoint = startPoint.clone();
    
    positions[0] = currentPoint.x;
    positions[1] = currentPoint.y;
    positions[2] = currentPoint.z;
    
    for (let i = 1; i < lightningSegments; i++) {
        const segmentLength = 0.35 + Math.random() * 0.3;
        const jitterX = (Math.random() - 0.5) * 0.22;
        const jitterY = (Math.random() - 0.5) * 0.22;
        const jitterZ = (Math.random() - 0.5) * 0.22;
        
        currentPoint.x += dirVec.x * segmentLength + jitterX;
        currentPoint.y += dirVec.y * segmentLength + jitterY;
        currentPoint.z += dirVec.z * segmentLength + jitterZ;
        
        positions[i * 3] = currentPoint.x;
        positions[i * 3 + 1] = currentPoint.y;
        positions[i * 3 + 2] = currentPoint.z;
    }
    
    posAttr.needsUpdate = true;
    line.material.opacity = 1.0;
    line.visible = true;
    line.userData.age = 0;
    line.userData.life = 0.12 + Math.random() * 0.15; // Realistic crackles fade fast (0.12s - 0.27s)
    
    activeLightningIndex = (activeLightningIndex + 1) % numLightning;
}

// Continuous plasma displacement updates to generate flicker
function updateLightning(delta) {
    for (let i = 0; i < numLightning; i++) {
        const line = lightningPool[i];
        if (line.visible) {
            line.userData.age += delta;
            
            if (line.userData.age >= line.userData.life) {
                line.visible = false;
            } else {
                const ratio = 1 - (line.userData.age / line.userData.life);
                line.material.opacity = ratio;
                
                // Continuous jitter on live segments to create a true flickering electric current
                const posAttr = line.geometry.attributes.position;
                const positions = posAttr.array;
                for (let j = 1; j < lightningSegments; j++) {
                    positions[j * 3] += (Math.random() - 0.5) * 0.05;
                    positions[j * 3 + 1] += (Math.random() - 0.5) * 0.05;
                    positions[j * 3 + 2] += (Math.random() - 0.5) * 0.05;
                }
                posAttr.needsUpdate = true;
            }
        }
    }
}

const localLeft = new THREE.Vector3(-0.25, 0.1, 0.5);
const localRight = new THREE.Vector3(0.25, 0.1, 0.5);

function emitTrail() {
    if (!car || !isAccelerating) return;
    
    car.updateMatrixWorld();
    
    const leftWorld = localLeft.clone().applyMatrix4(car.matrixWorld);
    const rightWorld = localRight.clone().applyMatrix4(car.matrixWorld);
    
    // Calculates vector heading backward from the model's current rotation
    const carForward = new THREE.Vector3(0, 0, -1);
    carForward.applyQuaternion(car.quaternion);
    const carBackward = carForward.clone().multiplyScalar(-1).normalize();
    
    spawnLightningBolt(leftWorld, carBackward);
    spawnLightningBolt(rightWorld, carBackward);
}

// --- STEP 4: Loader Logic ---
let car;
let mixer;
let carAnimations = [];
let activeAction = null;
const clock = new THREE.Clock();

const loader = new THREE.GLTFLoader();
const modelFile = 'my_car.glb'; 

loader.load(
    modelFile, 
    function (gltf) {
        car = gltf.scene;
        car.scale.set(0.9, 0.9, 0.9); 
        carGroup.add(car);

        car.position.set(1.5, -0.5, 0);
        car.rotation.set(0, -0.8, 0);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(car);
            carAnimations = gltf.animations;

            // Listens for LoopOnce actions and triggers the exit drift
            mixer.addEventListener('finished', (e) => {
                if (e.action.getClip().name === 'AllActions' && lastSection === 'where-headed') {
                    raceAndVanish();
                }
            });
        }

        modelMove();
        
        // Final completion call to fade out loader
        setTimeout(() => {
            updateLoaderProgress(100);
        }, 500);
    },
    function (xhr) {
        if (xhr.total > 0) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            // Cap visual loading at 99% until file parse sequence completes
            updateLoaderProgress(Math.min(percentComplete, 99));
        }
    },
    function (error) {
        console.error("Error loading model: ", error);
        updateLoaderProgress(100); // Soft failsafe to allow entry
    }
);

// --- ANIMATION CONTROLLER ---
function playSectionAnimation(animName) {
    if (!mixer || carAnimations.length === 0 || !animName) {
        if (activeAction) {
            activeAction.fadeOut(0.5);
            activeAction = null;
        }
        return;
    }

    const clip = THREE.AnimationClip.findByName(carAnimations, animName);
    if (!clip) return;

    const nextAction = mixer.clipAction(clip);

    // Play AllActions only once inside Section 5 to transition properly
    if (animName === 'LeftDoorAction' || 
        animName === 'FrontDoorWindshieldAction' || 
        (lastSection === 'where-headed' && animName === 'AllActions')) {
        nextAction.setLoop(THREE.LoopOnce);
        nextAction.clampWhenFinished = true;
    } else {
        nextAction.setLoop(THREE.LoopRepeat);
    }

    if (activeAction && activeAction !== nextAction) {
        activeAction.fadeOut(0.5);
        nextAction.reset().fadeIn(0.5).play();
    } else if (!activeAction || !activeAction.isRunning()) {
        nextAction.reset().fadeIn(0.5).play();
    }

    activeAction = nextAction;
}

// --- EXIT DRIVE TIMELINE ---
function raceAndVanish() {
    if (!car) return;

    gsap.killTweensOf(car.position);
    gsap.killTweensOf(car.scale);
    gsap.killTweensOf('#container3D');

    isAccelerating = true;

    // Speeds the car down the road over 1.6s, targeting further to the right (x = 1.2)
    gsap.to(car.position, {
        x: 1.2,    
        y: -0.35,  
        z: -22,    
        duration: 1.6,
        ease: "power3.in",
        onComplete: () => {
            isAccelerating = false;
            // Delay 2 seconds, then execute entrance loop
            if (lastSection === 'where-headed') {
                loopTimeoutId = setTimeout(() => {
                    raceEntrance();
                }, 2000);
            }
        }
    });

    // Scales the car to 0 matching position timeline
    gsap.to(car.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.6,
        ease: "power3.in"
    });

    // Fades container cleanly with a delay so the car gets far first
    gsap.to('#container3D', {
        opacity: 0,
        duration: 0.5,
        delay: 1.1, 
        ease: "power1.out"
    });
}

// --- ENTRANCE LOOP TIMELINE ---
function raceEntrance() {
    if (!car || lastSection !== 'where-headed') return;

    // Reset position at the border of the viewport
    car.position.set(2.5, -1.2, 8.0);
    car.rotation.set(0.08, -3, 0);
    car.scale.set(0.9, 0.9, 0.9);

    gsap.killTweensOf('#container3D');
    gsap.to('#container3D', {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out"
    });

    isAccelerating = true;

    // Decelerates the model back to the resting coordinates
    gsap.killTweensOf(car.position);
    gsap.to(car.position, {
        x: 2.2,
        y: -0.65,
        z: 1.4,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
            isAccelerating = false;
            playSectionAnimation('AllActions');
        }
    });
}

// --- STEP 5: Mouse tracking ---
const mouse = { x: 0, y: 0 };
let targetGroupRotationX = 0;
let targetGroupRotationY = 0;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    targetGroupRotationY = mouse.x * 0.03;  
    targetGroupRotationX = -mouse.y * 0.02; 
});

window.addEventListener('mouseleave', () => {
    targetGroupRotationX = 0;
    targetGroupRotationY = 0;
});

// Render Loop
function reRender3D() {
    requestAnimationFrame(reRender3D);
    
    // Complete frame suspension when off-screen to preserve user GPU cycles
    if (!isRendererRunning) return;
    
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    
    if (car) {
        carGroup.rotation.y += (targetGroupRotationY - carGroup.rotation.y) * 0.18;
        carGroup.rotation.x += (targetGroupRotationX - carGroup.rotation.x) * 0.18;
        
        if (isAccelerating) {
            emitTrail();
        }
    }

    updateLightning(delta);
    
    renderer.render(scene, camera);
}
reRender3D();

// --- STEP 6: GSAP Horizontal Pin Slider ---
const panels = gsap.utils.toArray("#horizontal-scroll .portfolio-section");
const totalPanels = panels.length;

gsap.set(panels.slice(1), { scale: 0.84, opacity: 0 });

const pinTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: "#pin-container",
        pin: true,
        scrub: 0.1,
        start: "top top",
        end: () => `+=${window.innerHeight * (totalPanels - 1) * 1.5}`,
        invalidateOnRefresh: true,
        snap: {
            snapTo: 1 / (totalPanels - 1),
            duration: 0.35,
            delay: 0,
            ease: "power2.out"
        }
    }
});

pinTimeline.to("#horizontal-scroll", {
    x: () => -(window.innerWidth * (totalPanels - 1)),
    duration: totalPanels - 1,
    ease: "none"
}, 0);

panels.forEach((panel, i) => {
    if (i < totalPanels - 1) {
        const nextPanel = panels[i + 1];
        const startTime = i;

        pinTimeline.to(panel, {
            scale: 0.84,
            opacity: 0,
            duration: 0.4,
            ease: "power1.inOut"
        }, startTime);

        pinTimeline.fromTo(nextPanel, 
            { scale: 0.84, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "power1.inOut" },
            startTime + 0.4
        );
    }
});

// Dynamic Snapping for Normal Linear Page Sections
function initDynamicVerticalSnapping() {
    const mainSections = document.querySelectorAll(
        '.container > main, .container > #pin-container'
    );
    
    mainSections.forEach((sec) => {
        ScrollTrigger.create({
            trigger: sec,
            start: "top bottom",
            end: "top top",
            snap: {
                snapTo: 1,
                duration: 0.35,
                delay: 0,
                ease: "power2.out"
            }
        });
    });
}
initDynamicVerticalSnapping();

// Smooth Anchoring
document.querySelectorAll('nav a, .nav-btn, .anc-go').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        
        if (!targetEl) return;

        if (targetEl.closest('#horizontal-scroll')) {
            const targetIndex = panels.indexOf(targetEl);
            if (targetIndex !== -1) {
                const start = pinTimeline.scrollTrigger.start;
                const end = pinTimeline.scrollTrigger.end;
                const progress = targetIndex / (totalPanels - 1);
                const scrollPosition = start + (end - start) * progress;
                
                window.scrollTo({
                    top: scrollPosition,
                    behavior: "smooth"
                });
            }
        } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- STEP 7: Intro Sequence System ---
let lastSection = 'home'; 
let introSequenceTriggered = false; 
let introTimeline = null; 

function prepareTypewriter(element) {
    const children = Array.from(element.childNodes);
    children.forEach(node => {
        if (node.nodeType === 3) {
            const text = node.nodeValue;
            if (text.trim() === '') return;
            
            const fragment = document.createDocumentFragment();
            const words = text.split(/(\s+)/);
            
            words.forEach(word => {
                if (/\s+/.test(word)) {
                    fragment.appendChild(document.createTextNode(word));
                } else {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'typewriter-word';
                    for (let char of word) {
                        const span = document.createElement('span');
                        span.className = 'typewriter-char';
                        span.textContent = char;
                        wordSpan.appendChild(span);
                    }
                    fragment.appendChild(wordSpan);
                }
            });
            node.replaceWith(fragment);
        } else if (node.nodeType === 1) { 
            prepareTypewriter(node);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const manifesto = document.querySelector('.intro-manifesto');
    const footer = document.querySelector('.intro-footer');
    if (manifesto) prepareTypewriter(manifesto);
    if (footer) prepareTypewriter(footer);
    resetIntroElements();
    initGlobalTiltEffect(); // Triggers global interactive card tracking
    initInteractiveClouds(); // Handles tap triggers on mobile environments
    
    // Boot loading screen loops & rule systems
    initLoaderWebGL();
    animateLoaderRules();
});

function resetIntroElements() {
    introSequenceTriggered = false;
    if (introTimeline) introTimeline.kill();

    gsap.killTweensOf('.typewriter-char');
    gsap.killTweensOf('.red-line1, .red-line2, .intro-footer .red-line');
    gsap.killTweensOf('.intro-overlay-image'); // Resets active transitions on the overlay

    gsap.set('.typewriter-char', { opacity: 0 });
    gsap.set('.red-line1, .red-line2, .intro-footer .red-line', { opacity: 0, scaleX: 0 });
    gsap.set('.intro-overlay-image', { opacity: 0, y: 40 }); // Hides character image & translates back down

    const children = document.querySelectorAll('.intro-manifesto > *, .intro-footer > *');
    children.forEach(child => {
        if (child.tagName === 'P') {
            gsap.set(child, { opacity: 1 });
        } else {
            gsap.set(child, { opacity: 0 });
        }
    });
}

function runIntroSequence(activeData) {
    introTimeline = gsap.timeline();

    gsap.set('#container3D', { opacity: 0 });

    const manifestoChildren = document.querySelectorAll('.intro-manifesto > *');
    manifestoChildren.forEach(child => {
        if (child.tagName === 'P') {
            gsap.set(child, { opacity: 1 });
            gsap.set(child.querySelectorAll('.typewriter-char'), { opacity: 0 });
        } else {
            gsap.set(child, { opacity: 0 });
        }
    });

    const footerChildren = document.querySelectorAll('.intro-footer > *');
    footerChildren.forEach(child => {
        if (child.tagName === 'P') {
            gsap.set(child, { opacity: 1 });
            gsap.set(child.querySelectorAll('.typewriter-char'), { opacity: 0 });
        } else {
            gsap.set(child, { opacity: 0 });
        }
    });

    manifestoChildren.forEach(child => {
        if (child.tagName === 'P') {
            const chars = child.querySelectorAll('.typewriter-char');
            if (chars.length > 0) {
                introTimeline.to(chars, {
                    opacity: 1,
                    duration: 1, 
                    stagger: 0.033,
                    ease: "none"
                });
            }
        } else if (child.classList.contains('red-line1') || child.classList.contains('red-line2')) {
            introTimeline.fromTo(child, 
                { scaleX: 0, transformOrigin: "left", opacity: 1 }, 
                { scaleX: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    });

    // Fade overlay image smoothly from bottom to top once the "...THEY CALL ME--" typewriter ends
    introTimeline.to('.intro-overlay-image', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out"
    });

    introTimeline.add(() => {
        const startCarTransition = () => {
            if (!car) {
                setTimeout(startCarTransition, 100);
                return;
            }

            gsap.to('#container3D', { opacity: 1, duration: 0.6, ease: "power1.out" });

            gsap.set(car.scale, { x: 0.9, y: 0.9, z: 0.9 });
            gsap.set(car.position, { x: 2.2, y: -1.1, z: -3.0 });
            gsap.set(car.rotation, { x: 0.05, y: -0.7, z: 0 });

            if (activeAction) activeAction.stop();

            gsap.to(car.position, {
                x: activeData.position.x, 
                y: activeData.position.y, 
                z: activeData.position.z, 
                duration: 1.4, 
                ease: "power2.out",
                onComplete: () => {
                    playSectionAnimation(activeData.animation);
                }
            });

            gsap.to(car.rotation, {
                x: activeData.rotation.x, 
                y: activeData.rotation.y, 
                z: activeData.rotation.z, 
                duration: 1.4,
                ease: "back.out(0.4)" 
            });
        };

        startCarTransition();
    });

    introTimeline.set({}, {}, "+=1.4");

    footerChildren.forEach(child => {
        if (child.tagName === 'P') {
            const chars = child.querySelectorAll('.typewriter-char');
            if (chars.length > 0) {
                introTimeline.to(chars, {
                    opacity: 1,
                    duration: 1,
                    stagger: 0.03,
                    ease: "none"
                });
            }
        } else if (child.classList.contains('red-line')) {
            introTimeline.fromTo(child, 
                { scaleX: 0, transformOrigin: "center", opacity: 1 }, 
                { scaleX: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    });
}

function playCarDriftDirectly(activeData) {
    gsap.to('#container3D', { opacity: 1, duration: 1, ease: "power1.out" });
    gsap.to(car.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 1.5, ease: "power1.out" });

    // Instantly slide up the overlay to correct layout configurations if scroll sequences are bypassed
    gsap.to('.intro-overlay-image', { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" });

    gsap.to(car.position, {
        x: activeData.position.x,
        y: activeData.position.y,
        z: activeData.position.z,
        duration: 1.4,
        ease: "power2.out",
        onComplete: () => {
            playSectionAnimation(activeData.animation);
        }
    });

    gsap.to(car.rotation, {
        x: activeData.rotation.x,
        y: activeData.rotation.y,
        z: activeData.rotation.z,
        duration: 1.4,
        ease: "back.out(0.4)"
    });
}

// --- STEP 8: Scroll Viewport Handler ---
function modelMove() {
    if (!car) return; 

    const sections = document.querySelectorAll('.portfolio-section, main');
    let currentSection = 'home';

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const isInsideHorizontal = (rect.left <= centerX) && (rect.right >= centerX);
        const isInsideVertical = (rect.top <= centerY) && (rect.bottom >= centerY);
        
        if (isInsideHorizontal && isInsideVertical) {
            currentSection = section.id;
        }
    });

    if (currentSection !== lastSection) {
        // Clears active loop timers on transition change
        if (loopTimeoutId) {
            clearTimeout(loopTimeoutId);
            loopTimeoutId = null;
        }

        // Resets the parting state when moving away from the Skills viewport
        if (currentSection !== 'skills') {
            const skillsEl = document.getElementById('skills');
            if (skillsEl) {
                skillsEl.classList.remove('parted');
            }
        }

        const activeData = arrPositionModel.find(val => val.id === currentSection);

        if (activeData) {
            gsap.killTweensOf(car.position);
            gsap.killTweensOf(car.rotation);
            gsap.killTweensOf(car.scale);
            gsap.killTweensOf('#container3D');

            isAccelerating = false;

            // GPU & Canvas management for sections that do not require 3D rendering
            const disabledSections = ['home', 'skills'];
            const shouldDisable3D = disabledSections.includes(currentSection);

            if (shouldDisable3D) {
                gsap.to('#container3D', { 
                    opacity: 0, 
                    duration: 1, 
                    ease: "power1.out",
                    onComplete: () => {
                        // Suspend loop calculation cycles when user is idle in non-render zones
                        if (disabledSections.includes(currentSection)) {
                            isRendererRunning = false;
                        }
                    }
                });
                if (currentSection === 'home') {
                    resetIntroElements();
                }
            } else {
                // Re-enables the rendering processes immediately upon scroll
                if (!isRendererRunning) {
                    isRendererRunning = true;
                    clock.getDelta(); // Clears delta gap to prevent viewport rendering jumps
                }
                document.getElementById('container3D').style.display = 'block';

                if (currentSection !== 'intro') {
                    gsap.to('#container3D', { opacity: 1, duration: 1, ease: "power1.out" });
                }

                // Check for forward transitions starting from 'intro'
                if (lastSection === 'intro' && currentSection !== 'home' && currentSection !== 'intro') {
                    if (activeAction) activeAction.fadeOut(0.3);

                    isAccelerating = true;

                    const tl = gsap.timeline({
                        onComplete: () => {
                            isAccelerating = false;
                            // Ensure animation is triggered only if we haven't scrolled away
                            if (currentSection !== 'home' && currentSection !== 'intro') {
                                playSectionAnimation(activeData.animation);
                            }
                        }
                    });

                    // 1. Speeds directly past the camera (racing towards user), scaling up massively
                    tl.to(car.position, {
                        x: -0.5, 
                        y: -2.0, 
                        z: 14.0, // Moves extremely close to the camera plane
                        duration: 0.5,
                        ease: "power3.in"
                    })
                    .to(car.scale, {
                        x: 3.5,
                        y: 3.5,
                        z: 3.5,
                        duration: 0.5,
                        ease: "power3.in"
                    }, 0);

                    // 2. Instantly teleports back behind the camera horizon to prepare entrance
                    tl.add(() => {
                        car.position.set(activeData.position.x + 1.5, activeData.position.y + 0.5, -2.0);
                        car.rotation.set(activeData.rotation.x, activeData.rotation.y, activeData.rotation.z);
                        car.scale.set(0.15, 0.15, 0.15);
                    });

                    // 3. Decelerates smoothly down onto the target viewport resting coordinates
                    tl.to(car.position, {
                        x: activeData.position.x,
                        y: activeData.position.y,
                        z: activeData.position.z,
                        duration: 0.9,
                        ease: "power2.out"
                    })
                    .to(car.scale, {
                        x: 0.9,
                        y: 0.9,
                        z: 0.9,
                        duration: 0.9,
                        ease: "power2.out"
                    }, "-=0.9");

                } else if (lastSection === 'home' && currentSection === 'intro') {
                    if (!introSequenceTriggered) {
                        introSequenceTriggered = true;
                        runIntroSequence(activeData);
                    } else {
                        playCarDriftDirectly(activeData);
                    }
                } else {
                    if (activeAction) activeAction.fadeOut(0.3);

                    gsap.to(car.scale, {
                        x: 0.9,
                        y: 0.9,
                        z: 0.9,
                        duration: 1.5,
                        ease: "power1.out"
                    });

                    gsap.to(car.position, {
                        x: activeData.position.x,
                        y: activeData.position.y,
                        z: activeData.position.z,
                        duration: 1.8,
                        ease: "power1.out",
                        onComplete: () => {
                            if (currentSection !== 'home') {
                                playSectionAnimation(activeData.animation);
                            }
                        }
                    });

                    gsap.to(car.rotation, {
                        x: activeData.rotation.x,
                        y: activeData.rotation.y,
                        z: activeData.rotation.z,
                        duration: 1.8,
                        ease: "power1.out"
                    });
                }
            }
        }
        
        lastSection = currentSection; 
    }
}

window.addEventListener('scroll', modelMove);

// --- STEP 9: Global Tilt Controller for Card elements ---
function initGlobalTiltEffect() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (centerY - y) / 15; 
            const angleY = (x - centerX) / 15;
            
            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// --- STEP 10: Touch interactions fallback for Mobile Devices ---
function initInteractiveClouds() {
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        skillsSection.addEventListener('click', () => {
            skillsSection.classList.add('parted');
        });
        skillsSection.addEventListener('touchstart', () => {
            skillsSection.classList.add('parted');
        }, { passive: true });
    }
}

// Handle resizing safely
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
