(function () {
    let scriptInterval;
    let isScriptRunning = false;

    function addDynamicCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #scriptToggleButton {
                position: fixed;
                top: 10px;  /* Movido para o topo */
                right: 10px;
                background-color: #111;
                border: 1px solid #ff0000;
                border-radius: 20px;
                padding: 10px 20px;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
                display: flex;
                align-items: center;
                font-family: "Courier New", Courier, monospace;
                transition: background-color 0.3s ease, color 0.3s ease;
                z-index: 1001; /* Garante que fique acima do modal */
            }

            #scriptToggleButton.active {
                background-color: #ff0000;
                color: #fff;
            }

            #scriptToggleSwitch {
                width: 40px;
                height: 20px;
                background-color: black;
                border-radius: 10px;
                position: relative;
                margin-left: 10px;
                transition: background-color 0.3s ease;
            }

            #scriptToggleSwitch:before {
                content: "";
                width: 18px;
                height: 18px;
                background-color: #ff0000;
                border-radius: 50%;
                position: absolute;
                top: 1px;
                left: 1px;
                transition: left 0.3s ease;
            }

            #scriptToggleButton.active #scriptToggleSwitch {
                background-color: #ff0000;
            }

            #scriptToggleButton.active #scriptToggleSwitch:before {
                left: 21px;
                background-color: #000;
            }

            #infoPopup {
                display: block;
                position: fixed;
                top: 60px; /* Ajustado para ficar abaixo do botão */
                right: 10px;
                background-color: #111;
                border: 1px solid #ff0000;
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
                width: 200px;
                font-family: "Courier New", Courier, monospace;
                color: #ff0000;
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }

    function createToggleButton() {
        const button = document.createElement('div');
        button.id = 'scriptToggleButton';
        button.innerHTML = 'Script';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #111;
            border: 1px solid #ff0000;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
            width: auto; /* Alterado para auto */
            font-family: "Courier New", Courier, monospace;
            z-index: 1001;
        `;

        const switchElem = document.createElement('div');
        switchElem.id = 'scriptToggleSwitch';
        button.appendChild(switchElem);
        button.addEventListener('click', toggleScript);
        document.body.appendChild(button);

        const infoPopup = document.createElement('div');
        infoPopup.id = 'infoPopup';
        infoPopup.innerHTML = `
            <strong style="color: #ff0000; font-family: 'Courier New', monospace;">To Salvo FREE:</strong>
            <p style="color: #fff; font-family: 'Courier New', monospace;"><strong>Criador:</strong> <span id="creatorName" style="color: #ff0000;">Louys</span></p>
            <p style="color: #fff; font-family: 'Courier New', monospace;"><strong>Contato:</strong> <a href="https://discord.com/users/685897345258487848" target="_blank" style="color: #ff0000; text-decoration: none;">Discord</a></p>
        `;
        document.body.appendChild(infoPopup);
    }

    function toggleScript() {
        const infoPopup = document.getElementById('infoPopup');
        if (isScriptRunning) {
            clearInterval(scriptInterval);
            isScriptRunning = false;
            document.getElementById('scriptToggleButton').classList.remove('active');
            infoPopup.style.display = 'block';
            console.log("%cScript parado", "color: red; font-weight: bold;");
        } else {
            startScript();
            isScriptRunning = true;
            document.getElementById('scriptToggleButton').classList.add('active');
            infoPopup.style.display = 'block';
            console.log("%cScript iniciado", "color: green; font-weight: bold;");
        }
    }

    function startScript() {
        let urlAtual = window.location.href;

        async function processExercise() {
            try {
                const response = await fetch(urlAtual);
                const data = await response.text();
                const scriptRegex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s;
                const match = data.match(scriptRegex);

                if (match) {
                    const jsonData = JSON.parse(match[1]);
                    const correctAnswerId = findCorrectAnswerId(jsonData);

                    if (correctAnswerId) {
                        console.log("%cResposta correta encontrada:", "color: green; font-weight: bold;", correctAnswerId);
                        selectAndProgressExercise(correctAnswerId);
                    }
                }
            } catch (error) {
                console.error('%cErro ao processar exercício:', 'color: red; font-weight: bold;', error);
            }
        }

        function findCorrectAnswerId(jsonData) {
            let correctAnswerId = null;
            jsonData.props.pageProps.content.children.forEach(section => {
                if (section.component === "ExerciseList") {
                    section.list.forEach(answer => {
                        if (answer.isCorrect) {
                            correctAnswerId = answer.id;
                        }
                    });
                }
            });
            return correctAnswerId;
        }

        function selectAndProgressExercise(correctAnswerId) {
            const correctAnswer = document.getElementById(correctAnswerId);
            if (correctAnswer) {
                const button = correctAnswer.querySelector('button');
                if (button) button.click();

                setTimeout(() => {
                    const submitButton = document.querySelector('.submit-button');
                    if (submitButton) submitButton.click();

                    setTimeout(() => {
                        const nextExerciseButton = document.querySelector('a.btn--primary.btn--size-md');
                        if (nextExerciseButton) {
                            nextExerciseButton.click();
                        } else {
                            const nextButton = document.querySelector('a.link.navigation-bar-item.link--custom');
                            if (nextButton && nextButton.innerText.includes('Próximo')) {
                                nextButton.click();
                            }
                        }
                    }, 500);
                }, 500);
            }
        }

        processExercise();
        scriptInterval = setInterval(() => {
            const newUrl = window.location.href;
            if (newUrl !== urlAtual) {
                urlAtual = newUrl;
                processExercise();
            }
        }, 1000);
    }

    addDynamicCSS();
    createToggleButton();
})();