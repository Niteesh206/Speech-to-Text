document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('start-btn');
    // const stopBtn = document.getElementById('stop-btn');
    // const processBtn = document.getElementById('process-btn');
    const speakBtn = document.getElementById('speak-btn');
    const resultP = document.getElementById('result');

    let finalTranscript = '';
    let interimTranscript = '';
    let silenceTimer; 


    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser doesn't support speech recognition. Try Chrome.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true; 

    recognition.onstart = function () {
        console.log('Speech recognition started');
        resetSilenceTimer();
    };

    recognition.onresult = function (event) {
        resetSilenceTimer();
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        resultP.innerHTML = `<strong>Final:</strong> ${finalTranscript}<br><em>Interim:</em> ${interimTranscript}`;
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error', event.error);
        clearTimeout(silenceTimer);
    };

    recognition.onend = function () {
        console.log('Speech recognition ended');
        clearTimeout(silenceTimer);
    };

    startBtn.addEventListener('click', function () {
        recognition.start();
    });

    // stopBtn.addEventListener('click', function () {
    //     recognition.stop();
    // });

    // processBtn.addEventListener('click', function () {
    //     const data = { transcript: finalTranscript };
    //     processTranscriptData(data);
    // });

    speakBtn.addEventListener('click', function () {
        speakText(finalTranscript);
    });

    function processTranscriptData(data) {
        console.log('Processing transcript data:', data);
        
        fetch('http://localhost:5000/receive_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: finalTranscript })
        }).then(response => response.json())
        .then(data => speakText(data['message']))
        .catch((error) => console.error('Error:', error));
    }

    function speakText(text) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        synthesis.speak(utterance);
    }

    function resetSilenceTimer() {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            recognition.stop();
            const data = { transcript: finalTranscript };
            processTranscriptData(data);
            console.log('Stopped due to silence');
        }, 3000);
    }
});
