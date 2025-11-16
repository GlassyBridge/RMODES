const iframe = document.getElementById('api-frame');
const uid = 'f8639447aabc43fca9d4b12edf09553d';

const client = new Sketchfab( iframe );
const msg = document.getElementById('msg');

msg.textContent = 'Loading...';

const annotations = [
    { title: '1st', content: 'wtv7', clicks: 0 },
    { title: '2nd', 'content': 'wtv6', clicks: 0 },
    { title: '3rd', 'content': 'wtv5', clicks: 0 },
    { title: '4th', 'content': 'wtv4', clicks: 0 },
    { title: '5th', 'content': 'wtv3', clicks: 0 },
    { title: '6th', 'content': 'wtv2', clicks: 0 },
    { title: '7th', 'content': 'wtv', clicks: 0 }
];

const animationSegments = [
    { start: 0.1, end: 10.3, speed: 1.0, title: "Experiment 1" },
    { start: 10.5, end: 24.3, speed: 1.0, title: "Experiment 2" },
    { start: 24.5, end: 40.76, speed: 0.5, title: "Experiment 3" },
];

const speedZones = [
    {startTime: 3.30, endTime: 6, speed: 3},
    {startTime: 15.30, endTime: 18.5, speed: 3},
    {startTime: 27.30, endTime: 30, speed: 3},
];

let currentSpeed = 1.0; 
let animCheckInterval = null; 
let sketchfabAPI = null;
let animationUID = null;

function reportError(source, error) {
    const errorText = typeof error === 'object' && error !== null && error.message 
                      ? error.message : String(error);
    msg.textContent = `ERROR (${source}): ${errorText}`;
}

function animationSpeedControl(api) {
    if (animCheckInterval) {
        clearInterval(animCheckInterval);
    }
    animCheckInterval = setInterval(() => {
        api.getCurrentTime((err, currentTime) => {
            if (err) {
                console.error("Error getting animation time:", err);
                clearInterval(animCheckInterval);
                return;
            }

            let targetSpeed = 1.0;
            let zoneIndex = -1;

            speedZones.forEach((zone, index) => {
                if (currentTime >= zone.startTime && currentTime < zone.endTime) {
                    targetSpeed = zone.speed;
                    zoneIndex = index; 
                }
            });
            
            if (targetSpeed !== currentSpeed) {
                api.setSpeed(targetSpeed, (err) => {
                    if (!err) {
                        currentSpeed = targetSpeed;
                    } else {
                        console.error("Failed to set speed:", err);
                    }
                });
            }
        });
    }, 100);
}

function assignAnnotations(api) {
    annotations.forEach((data, i) => {
        api.updateAnnotation(i, {
                title: data.title,
                content: data.content
            });
    });
}

// function annotationDetection(api) {
//     api.addEventListener('annotationSelect', function(selectedIndex) {
//         const clickedData = annotations[selectedIndex];
//         if (!clickedData) return;
//         clickedData.clicks++;
        
//         switch (selectedIndex) {
//             case 0:
//                 api.seekTo(10, () => {
//                     msg.textContent = `Annotation "${clickedData.title}" clicked ${clickedData.clicks} times. Seeking to 10s.`;
//                 });
//                 break;
//             case 1:
//                 msg.textContent = `Annotation "${clickedData.title}" clicked ${clickedData.clicks} times.`;
//                 break;
//             case 3:
//                 msg.textContent = `Annotation "${clickedData.title}" clicked ${clickedData.clicks} times. | Action: Highlight a specific component.`;
//                 break;
//             case 6:
//                 msg.textContent = `Annotation "${clickedData.title}" clicked ${clickedData.clicks} times. | Action: Open external link or play animation.`;
//                 break;
//             default:
//                 msg.textContent = `Annotation "${clickedData.title}" clicked ${clickedData.clicks} times. | Action: Default response for index ${selectedIndex}.`;
//                 break;
//         }
//     });
// }

function playSegment(segmentIndex) {
    if (!sketchfabAPI) {
        reportError('Play Segment', 'API or Animation UID not loaded yet.');
        return;
    }

    const segment = animationSegments[segmentIndex];

    sketchfabAPI.pause(() => { 
        sketchfabAPI.seekTo(segment.start, () => {
            sketchfabAPI.setSpeed(segment.speed, () => {
                sketchfabAPI.play(() => {
                    const playDurationMS = (segment.end - segment.start) / segment.speed * 1000;
                    
                    setTimeout(() => {
                        sketchfabAPI.pause();
                    }, playDurationMS);
                });
            });
        });
    });
}

client.init( uid, {
    success: function onSuccess( api ){
        sketchfabAPI = api;
        
        api.addEventListener( 'viewerready', function() {
            // assignAnnotations(api);
            // annotationDetection(api);
            animationSpeedControl(api);
            
            api.pause();
            msg.textContent = 'Viewer is ready.';
        });
    },
    error: function onError(err) {
        reportError('Viewer Init', err || 'Viewer error');
    },
    camera: 1,
    api_animation: 1,
    blending: 0,
    autostart: 0,
    transparent: 1,
    dnt: 0
});