// ==UserScript==
// @name         Hordes Forum Filter
// @description  Ce script permet de filtrer les forums de la section "Forum Monde".
// @icon         https://myhordes.fr/build/images/emotes/rptext.4fd67236.gif
// @namespace    http://tampermonkey.net/
// @version      1.7
// @author       Eliam
// @match        https://myhordes.fr/*
// @match        https://myhordes.de/*
// @match        https://myhordes.eu/*
// @match        https://myhord.es/*
// @updateURL    https://github.com/Croaaa/HordesForumFilter/raw/main/HordesForumFilter.user.js
// @downloadURL  https://github.com/Croaaa/HordesForumFilter/raw/main/HordesForumFilter.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addLanguageFilter() {
        const forumTitles = document.querySelectorAll('h5');
        let forumTitle;

        // Rechercher le titre "Forums Monde" ou ses équivalents
        forumTitles.forEach((title) => {
            if (title.nextElementSibling && title.nextElementSibling.className.includes('forumGroup')) {
                forumTitle = title; // Titre avant les forums du monde
            }
        });

        if (forumTitle && !document.querySelector('input[name="user_world_forum_lang"]')) {
            // Créer le conteneur des boutons radio
            const radioContainer = document.createElement('div');
            radioContainer.className = 'row-flex';
            radioContainer.style.marginTop = '5px';
            radioContainer.style.marginBottom = '10px';
            radioContainer.style.display = 'flex'; // Afficher les éléments en ligne
            radioContainer.style.alignItems = 'center'; // Centrer verticalement les éléments
            radioContainer.style.width = 'auto';

            // Ajouter les boutons radio avec drapeaux et libellés des langues
            const languages = [
                { value: 'fr', label: 'Français' , flag: '/build/images/lang/fr.22a557fa.png', title: 'Forums Monde', workshop: "L'Atelier artistique" },
                { value: 'en', label: 'English' , flag: '/build/images/lang/en.7e6d6ab4.png', title: 'World Forum', workshop: 'The Artistic Workshop' },
                { value: 'es', label: 'Español' , flag: '/build/images/lang/es.5ff50709.png', title: 'Foro Mundial', workshop: 'El Taller artístico' },
                { value: 'de', label: 'Deutsch', flag: '/build/images/lang/de.11b4c9d3.png', title: 'Weltforum', workshop: 'Die Künstlerwerkstatt' },
            ];

            const savedLanguage = localStorage.getItem('selectedLanguage') || 'fr';

            languages.forEach((lang) => {
                const cell = document.createElement('div');
                cell.className = 'padded cell';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';

                const label = document.createElement('label');
                label.className = 'small';
                label.style.display = 'flex';
                label.style.alignItems = 'center'; // Alignement vertical des drapeaux et case à cocher

                const flagImg = document.createElement('img');
                flagImg.src = lang.flag;
                flagImg.alt = lang.value;
                flagImg.style.width = '20px'; // Taille des drapeaux
                flagImg.style.height = 'auto';
                flagImg.style.marginRight = '2px'; // Réduit l'espace entre le drapeau et la case à cocher

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'user_world_forum_lang';
                radio.value = lang.value;
                radio.checked = lang.value === savedLanguage;
                radio.style.marginRight = '3px'; // Ajoute un pixel d'espacement entre la case à cocher et le drapeau

                const languageLabel = document.createElement('span');
                languageLabel.textContent = lang.label; // Ajouter le libellé de la langue
                languageLabel.style.marginLeft = '3px'; // Ajouter un petit espacement après le drapeau

                radio.addEventListener('change', () => {
                    filterForums(radio.value);
                    localStorage.setItem('selectedLanguage', radio.value); // Enregistre la langue sélectionnée
                    updateForumTitles(forumTitle, lang.title, lang.workshop); // Met à jour les titres des forums
                });

                label.appendChild(radio);
                label.appendChild(flagImg);
                label.appendChild(languageLabel); // Ajoute le libellé après le drapeau
                cell.appendChild(label);
                radioContainer.appendChild(cell);
            });

            forumTitle.parentNode.insertBefore(radioContainer, forumTitle.nextSibling);

            // Affiche les forums selon la langue enregistrée initialement
            filterForums(savedLanguage);
            // Met à jour le titre du forum selon la langue enregistrée
            const initialLang = languages.find((lang) => lang.value === savedLanguage);
            if (initialLang) {
                updateForumTitles(forumTitle, initialLang.title, initialLang.workshop);
            }
        }
    }

    function updateForumTitles(mainTitleElement, newMainTitle, newWorkshopTitle) {
        if (mainTitleElement) {
            mainTitleElement.textContent = newMainTitle; // Met à jour le titre principal
        }

        // Mettre à jour le titre du forum international
        const internationalForumTitle = document.querySelector('div[x-ajax-href="https://myhordes.fr/jx/forum/3142"] div > div');
        if (internationalForumTitle) {
            internationalForumTitle.textContent = newWorkshopTitle;
        }
    }

    function filterForums(language) {
        const allForums = document.querySelectorAll('.forumGroup');
        let internationalForum;

        allForums.forEach((forum) => {
            const header = forum.querySelector('.header');
            if (header) {
                header.style.display = 'none'; // Supprime les en-têtes de chaque forum
            }

            const img = forum.querySelector('img');
            if (img && img.alt === 'mu') {
                internationalForum = forum; // Identifier le World Forum (international)
                forum.style.display = 'none'; // Masquer temporairement
            } else if (img && img.alt === language) {
                forum.style.display = ''; // Affiche les forums correspondant à la langue sélectionnée
                forum.style.marginTop = '0'; // Supprime l'espace entre les boutons radio et les forums
            } else {
                forum.style.display = 'none'; // Masque les autres forums
            }
        });

        // Affiche le World Forum international juste sous les sections de la langue choisie
        if (internationalForum) {
            internationalForum.style.display = '';
            const lastLangForum = Array.from(allForums).reverse().find((forum) => {
                const img = forum.querySelector('img');
                return img && img.alt === language;
            });

            if (lastLangForum) {
                lastLangForum.parentNode.insertBefore(
                    internationalForum,
                    lastLangForum.nextSibling
                ); // Insère le World Forum juste après le dernier forum de la langue choisie
            }
        }
    }

    function logUrlChange() {
        if (window.location.pathname.endsWith('/jx/forum')) {
            if (!window.hasForumFilterBeenInitialized) {
                window.hasForumFilterBeenInitialized = true;
                const observer = new MutationObserver(addLanguageFilter);
                observer.observe(document.body, { childList: true, subtree: true });
                addLanguageFilter();
            }
        }
    }

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        logUrlChange();
    };

    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        logUrlChange();
    };

    window.addEventListener('popstate', logUrlChange);
    window.addEventListener('load', logUrlChange);
})();
