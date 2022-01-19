(function(window, doc) {
    'use strict';

    var gameNumbers = [];
    var typeInformations;
    var totalCart = 0;
    function app() {
        return {
            init: function init(){
                var ajax = new XMLHttpRequest();
                ajax.open('GET', './games/games.json');
                ajax.send()
                ajax.addEventListener('readystatechange', function(e) {
                    if (ajax.readyState === 4 && ajax.status === 200) {
                        var games = JSON.parse(ajax.responseText);
                        app().renderAllGames(games.types);
                    }
                });
                app().completeGame();
                app().clearGame();
                app().addToCart();
                app().getTotalCart();
            },

            renderAllGames: function renderAllGames(types){
                types.forEach(type => {
                    //Criar botão do jogo
                    var $button = doc.createElement('button');
                    $button.style.border = `2px solid ${type.color}`;
                    $button.innerHTML = type.type;
                    $button.classList.add('buttons', app().slugfy(type.type));
                    doc.getElementById('games-buttons').appendChild($button);
                    $button.addEventListener('click', (event) => app().renderGame(event, type), false);
                    var element  = document.createElement("style");
                    element.innerHTML = `.${app().slugfy(type.type)}.type-active {background-color: ${type.color} ; color: #ffffff}` ; // css rule
                    var header = document.getElementsByTagName("HEAD")[0] ;
                    header.appendChild(element) ;
                });
            },

            renderGame: function renderGame(evt, type){
                typeInformations = type;
                var $actives = doc.querySelectorAll('.type-active');
                $actives.forEach(el => el.classList.remove('type-active'));
                evt.target.classList.add('type-active');
                var $description = doc.querySelector('.description');
                $description.innerHTML = type.description;
                var $numbers = doc.querySelector('.numbers');
                $numbers.innerHTML = '';
                gameNumbers = [];
                for (var num = 1; num <= type.range; num++) {                    
                    app().renderButton($numbers, num, type['max-number']);
                };
            },

            renderButton: function renderButton($numbers, num, maxNumber){
                var $button = doc.createElement('button');
                $button.innerHTML = num;
                $button.classList.add('number');
                $button.setAttribute('id', num);
                $numbers.appendChild($button);
                $button.addEventListener('click', (event) => app().numberClick(event, num, maxNumber), false)
            },

            numberClick: function numberClick(evt, number, maxNumber){                
                if (gameNumbers.includes(number)) {
                    evt.target.classList.remove('active');
                    gameNumbers = gameNumbers.filter(num => num != number);
                } else {
                    if (gameNumbers.length < maxNumber) {
                        evt.target.classList.add('active');
                        gameNumbers.push(number);
                    } else {
                        alert('O jogo já está completo')
                    }
                }
            },
            
            completeGame: function() {
                var $button = doc.querySelector('#complete-game');
                $button.addEventListener('click', () => {
                    var $selecteds = doc.querySelectorAll('.active').length;
                    var num = 0;
                    while (num < typeInformations['max-number'] - $selecteds) {
                        var number = Math.floor(Math.random() * typeInformations.range) + 1;
                        if (gameNumbers.includes(number)) {
                            num - 1;
                        } else {
                            doc.getElementById(number).classList.add('active');
                            gameNumbers.push(number);
                            num++;
                        }
                    };
                }, false)
            },

            clearGame: function clearGame() {
                var $button = doc.querySelector('#clear-game');
                $button.addEventListener('click', function() {
                    var $actives = doc.querySelectorAll('.active');
                    $actives.forEach(el => el.classList.remove('active'));
                    gameNumbers = [];
                }, false);
            },

            addToCart: function addToCart() {
                var $button = doc.querySelector('.finish-game-button');
                $button.addEventListener('click', () => {
                    var numbers = gameNumbers.sort((a, b) => a - b).toString();

                    var $game = doc.createElement('div');
                    var $trashDiv = doc.createElement('div');
                    var $trashButton = doc.createElement('button');
                    var $trash = doc.createElement('img');
                    var $gameDiv = doc.createElement('div');
                    var $numbersOfGame = doc.createElement('p');
                    var $typeAndValueGameDiv = doc.createElement('div');
                    var $typeGame = doc.createElement('p');
                    var $priceGame = doc.createElement('p');
                    
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

                    var price = typeInformations.price;

                    $game.addEventListener('click', () => app().removeCart($game.id, price), false);
                    
                    var $games = doc.querySelector('.game-box');
                    $games.appendChild($game);

                    app().getTotalCart();
                }, false);
            },

            removeCart: function removeCart(id, price) {
                var $game = doc.getElementById(id);
                doc.querySelector('.game-box').removeChild($game);
                totalCart = totalCart - price;
                app().getTotalCart();
            },

            getTotalCart: function getTotalCart() {
                var $total = doc.querySelector('[class="total"]');
                $total.textContent = `TOTAL: ${totalCart.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}`;
            },
            
            slugfy: function slugfy (str) {
                str = str.replace(/^\s+|\s+$/g, ''); // trim
                str = str.toLowerCase();
                // remove accents, swap ñ for n, etc
                var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
                var to   = "aaaaeeeeiiiioooouuuunc------";
                for (var i=0, l=from.length ; i<l ; i++) {
                    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                }
                str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                    .replace(/\s+/g, '-') // collapse whitespace and replace by -
                    .replace(/-+/g, '-'); // collapse dashes
                return str;
            },
        }

    };
    app().init();
})(window, document);