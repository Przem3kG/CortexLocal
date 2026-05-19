const messagesDiv = document.getElementById("messages");
const inputField = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

// Skupienie pola wpisywania po załadowaniu strony
window.onload = () => inputField.focus();

// Funkcja tworząca standardowy dymek czatu
function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-msg`;
    msgDiv.textContent = text;
    messagesDiv.insertBefore(msgDiv, typingIndicator);
    scrollToBottom();
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Obsługa klawisza Enter
function handleEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Główna funkcja wysyłania i odbierania strumienia danych
async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // Zablokuj interfejs i dodaj wiadomość użytkownika
    addMessage(text, "user");
    inputField.value = "";
    inputField.disabled = true;
    sendBtn.disabled = true;
    typingIndicator.style.display = "block";
    scrollToBottom();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: text})
        });

        if (!response.ok) throw new Error("Błąd serwera");

        // Ukryj kropki i stwórz pusty dymek na odpowiedź AI
        typingIndicator.style.display = "none";
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ai-msg`;
        messagesDiv.insertBefore(msgDiv, typingIndicator);

        // Odbieranie danych w czasie rzeczywistym (Streams API)
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        // POPRAWKA 1: Definiujemy zmienną, której brakowało
        let pelnaOdpowiedzMarkdown = "";

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            const parts = buffer.split('\n\n');
            buffer = parts.pop();

            for (const part of parts) {
                if (part.startsWith('data: ')) {
                    try {
                        const jsonStr = part.substring(6);
                        const data = JSON.parse(jsonStr);

                        // POPRAWKA 2: Python wysyła 'over', więc tu też musi być 'over'
                        if (data.over) {
                            inputField.disabled = false;
                            sendBtn.disabled = false;
                            inputField.focus();
                            return;
                        }

                        // POPRAWKA 3: Zbieramy tekst do zmiennej, zabezpieczając przed undefined
                        if (data.tekst !== undefined && data.tekst !== null) {
                            pelnaOdpowiedzMarkdown += data.tekst;

                            if (typeof marked !== 'undefined') {
                                msgDiv.innerHTML = marked.parse(pelnaOdpowiedzMarkdown);
                            } else {
                                msgDiv.textContent = pelnaOdpowiedzMarkdown;
                            }
                            scrollToBottom();
                        }
                    } catch (e) {
                        console.warn("Pominięto uszkodzony pakiet:", e);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Błąd podczas wysyłania wiadomości:", error);
        addMessage("Wystąpił błąd. Spróbuj ponownie.", "ai");
        inputField.disabled = false;
        sendBtn.disabled = false;
        inputField.focus();
    } finally {
        typingIndicator.style.display = "none";
    }
}