(function(_window, doc) { // _ antes do window (ou qualquer outro parâmetro) indica que não está utilizando
    'use strict';

    let gameNumbers = [];
    let typeInformations;
    let totalCart = 0;
    function app() {
        return {
            init: function init(){
                const ajax = new XMLHttpRequest();
                ajax.open('GET', './games/games.json');
                ajax.send()
                ajax.addEventListener('readystatechange', function() {
                    if (ajax.readyState === 4 && ajax.status === 200) {
                        const games = JSON.parse(ajax.responseText);
                        app().renderAllGames(games.types);
                        const firstTypeActive = doc.getElementsByClassName(app().slugfy(games.types[0].type))[0];
                        firstTypeActive.click();
                    }
                });
                app().completeGame();
                app().clearGame();
                app().addToCart();
                app().getTotalCart();
                app().emptyCartMessagem();
            },

            renderAllGames: function renderAllGames(types){
                types.forEach(type => {
                    const $button = doc.createElement('button');
                    $button.style.border = `2px solid ${type.color}`;
                    $button.innerHTML = type.type;
                    $button.classList.add('buttons', app().slugfy(type.type));
                    doc.getElementById('games-buttons').appendChild($button);
                    $button.addEventListener('click', (event) => app().renderGame(event, type), false);
                    const element  = document.createElement("style");
                    element.innerHTML = `.${app().slugfy(type.type)}.type-active { color: #ffffff ; background-color: ${type.color}} 
                    .${app().slugfy(type.type)} .active {background-color: ${type.color}`;
                    const header = document.getElementsByTagName("HEAD")[0];
                    header.appendChild(element);
                });
            },
            
            renderGame: function renderGame(evt, type){
                typeInformations = type;
                const $actives = doc.querySelectorAll('.type-active');
                $actives.forEach(el => el.classList.remove('type-active'));
                evt.target.classList.add('type-active');
                const $description = doc.querySelector('.description');
                $description.innerHTML = type.description;
                const $numbers = doc.querySelector('.numbers');
                $numbers.classList.remove(...$numbers.classList);
                $numbers.classList.add(app().slugfy(type.type), 'numbers');
                $numbers.innerHTML = '';
                gameNumbers = [];
                for (let num = 1; num <= type.range; num++) {                    
                    app().renderButton($numbers, num, type['max-number']);
                };
                app().renderTitle(type);
            },
            
            renderTitle: function renderTitle(type) {
                const $title = doc.querySelector('.title');
                if ($title.hasChildNodes()) {
                    let child = $title.firstChild;
                    let lastChild = $title.lastChild;
                    $title.removeChild(child);
                    $title.removeChild(lastChild);
                } 
                const $p = doc.createElement('p');
                const $strong = doc.createElement('strong');
                $strong.innerHTML = 'NEW BET';
                $p.innerHTML = `FOR ${type.type.toUpperCase()}`;
                $title.appendChild($strong);
                $title.appendChild($p);
            },
            
            renderButton: function renderButton($numbers, num, maxNumber){
                const $button = doc.createElement('button');
                $button.innerHTML = num;
                $button.classList.add('number');
                $button.setAttribute('id', num);
                $numbers.appendChild($button);
                $button.addEventListener('click', (event) => app().numberClick(event, num, maxNumber), false)
            },

            numberClick: function numberClick(evt, number, maxNumber){                
                if (gameNumbers.includes(number)) {
                    evt.target.classList.remove('active');
                    evt.target.style.cssText = '';
                    gameNumbers = gameNumbers.filter(num => num != number);
                } else {
                    if (gameNumbers.length < maxNumber) {
                        evt.target.classList.add('active');
                        evt.target.style.cssText = `background-color: ${typeInformations.color}`;
                        gameNumbers.push(number);
                    } else {
                        alert('O jogo já está completo!');
                    }
                }
            },
            
            completeGame: function() {
                const $button = doc.querySelector('#complete-game');
                $button.addEventListener('click', () => {
                    const $selecteds = doc.querySelectorAll('.active').length;
                    let num = 0;
                    while (num < typeInformations['max-number'] - $selecteds) {
                        const number = Math.floor(Math.random() * typeInformations.range) + 1;
                        if (gameNumbers.includes(number)) {
                            num - 1;
                        } else {
                            doc.getElementById(number).classList.add('active');
                            gameNumbers.push(number);
                            num++;
                        };
                    };
                }, false)
            },

            clearGame: function clearGame() {
                const $button = doc.querySelector('#clear-game');
                $button.addEventListener('click', function() {
                    const $actives = doc.querySelectorAll('.active');
                    $actives.forEach(el => el.classList.remove('active'));
                    $actives.forEach(el => el.style.cssText = '');
                    gameNumbers = [];
                }, false);
            },

            addToCart: function addToCart() {
                const $button = doc.querySelector('.finish-game-button');
                $button.addEventListener('click', () => {
                    const numbers = gameNumbers.sort((a, b) => a - b).toString();

                    const $game = doc.createElement('div');
                    const $trashDiv = doc.createElement('div');
                    const $trashButton = doc.createElement('button');
                    const $trash = doc.createElement('img');
                    const $gameDiv = doc.createElement('div');
                    const $numbersOfGame = doc.createElement('p');
                    const $typeAndValueGameDiv = doc.createElement('div');
                    const $typeGame = doc.createElement('p');
                    const $priceGame = doc.createElement('p');
                    
                    $game.setAttribute('id', Date.now().toString());
                    $trash.setAttribute('src', './img/trash.svg');

                    $game.classList.add('game');
                    $trashButton.classList.add('trash-button');
                    $trashDiv.classList.add('trash-icon');
                    $gameDiv.classList.add('bet');
                    $typeAndValueGameDiv.classList.add('type-value');
                    $numbersOfGame.classList.add('numbers-game');
                    $typeGame.classList.add('type-game');
                    $priceGame.classList.add('value-game');

                    $gameDiv.style.borderLeft = `4px solid ${typeInformations.color}`;
                    $gameDiv.style.color = `${typeInformations.color}`;

                    $numbersOfGame.textContent = numbers;
                    $typeGame.innerHTML = typeInformations.type;
                    $priceGame.innerHTML = typeInformations.price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
                    totalCart += typeInformations.price;
                    
                    $trashButton.appendChild($trash);
                    $trashDiv.appendChild($trashButton);
                    $typeAndValueGameDiv.appendChild($typeGame);
                    $typeAndValueGameDiv.appendChild($priceGame);
                    $gameDiv.appendChild($numbersOfGame);
                    $gameDiv.appendChild($typeAndValueGameDiv);
                    $game.appendChild($trashDiv);
                    $game.appendChild($gameDiv);

                    const price = typeInformations.price;

                    $game.addEventListener('click', () => app().removeCart($game.id, price), false);
                    
                    const $games = doc.querySelector('.game-box');
                    if (app().checkIfGameIsComplete()) {
                        $games.appendChild($game);

                        app().getTotalCart();

                        doc.querySelector('#clear-game').click();
    
                        const $message = doc.querySelector('#empty-message');
                        if ( $message ) {
                            $games.removeChild($message);
                        }
                    };
                }, false);
            },

            checkIfGameIsComplete: function checkIfGameIsComplete() {
                const numbersToComplete = typeInformations['max-number'] - gameNumbers.length;
                console.log(numbersToComplete);
                if (numbersToComplete === 0) {
                    return true;
                } else {
                    alert(`Faltam ${numbersToComplete} números para completar o jogo`);
                    return false;
                };
            },

            removeCart: function removeCart(id, price) {
                const $game = doc.getElementById(id);
                const $cart = doc.querySelector('.game-box')
                $cart.removeChild($game);
                totalCart = totalCart - price;
                app().getTotalCart();

                if (!$cart.hasChildNodes()) {
                    app().emptyCartMessagem();
                };
            },

            getTotalCart: function getTotalCart() {
                const $total = doc.querySelector('[class="total"]');
                $total.textContent = `TOTAL: ${totalCart.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}`;
            },
            
            slugfy: function slugfy (str) {
                str = str.replace(/^\s+|\s+$/g, ''); // trim
                str = str.toLowerCase();
                // remove accents, swap ñ for n, etc
                let from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
                let to   = "aaaaeeeeiiiioooouuuunc------";
                for (let i=0, l=from.length ; i<l ; i++) {
                    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                }
                str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                    .replace(/\s+/g, '-') // collapse whitespace and replace by -
                    .replace(/-+/g, '-'); // collapse dashes
                return str;
            },

            emptyCartMessagem: function () {
                const $cart = doc.querySelector('.game-box');
                const $p = doc.createElement('p');
                $p.setAttribute('id', 'empty-message');
                $p.innerHTML = 'Your cart is empty';
                $cart.appendChild($p);
            }
        }

    };
    app().init();
})(window, document);