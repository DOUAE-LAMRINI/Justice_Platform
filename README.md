# 🔐 Smart Justice – Système Intelligent de Sécurisation de Stock

## 🎓 Projet de fin de formation – Génie Informatique Embarquée  
- **Établissement d’accueil :** Direction Régionale du Ministère de la Justice OUJDA
- **Encadrant :** Monsieur Khalid Salhi  

---

## 🧠 Présentation générale

Dans le cadre de ma formation en Génie Informatique Embarquée, j’ai conçu et développé un projet complet et multidisciplinaire intitulé **Smart Justice**, qui vise à sécuriser intelligemment les stocks de la Direction Régionale du Ministère de la Justice. Le projet repose sur l’intégration harmonieuse de **systèmes embarqués**, **intelligence artificielle**, **vision par ordinateur**, et **développement web full-stack**.

---

## 🧩 Objectifs du projet

- Renforcer la sécurité des stocks à l’aide de capteurs intelligents.
- Intégrer un module de vision par caméra avec IA pour détecter les anomalies visuelles.
- Offrir une **plateforme web** intuitive pour le suivi, l’analyse et la gestion des incidents.
- Fournir une **interface conversationnelle multilingue** et émotionnellement sensible pour les citoyens.

---

## ⚙️ Architecture du système

### 1. 🛠️ Composante matérielle (IoT embarqué)
- **Microcontrôleurs** : Arduino UNO Rev3 & ESP32-WROOM
- **Capteurs intégrés** : DHT22 (température/humidité), MQ3 (gaz), PIR (mouvement), LDR, capteur de son, capteur de flamme, capteur de fuite d’eau
- **Actionneurs** : Buzzer, LEDs, servomoteur
- **Interfaces** : Écran LCD I2C 16x2, module RFID RC522
- **Communication série** entre Arduino & ESP32 avec diviseur de tension

### 2. 📷 Caméra intelligente (Deep Learning)
- Détection en temps réel via des modèles préentraînés : YOLOv5 / SSD
- Développement dans **Google Colab** avec **GPU T4**
- Utilisation de TensorFlow, PyTorch, OpenCV
- Module en cours d’amélioration (problèmes d’angle, qualité d’image, dataset limité)

### 3. 🌐 Application Web – *Justice Platform*
- **Front-end** : React.js
- **Back-end** : Node.js + Express
- **Base de données** : MySQL (hébergée localement via XAMPP)
- Séparation claire des rôles :
  - 🧑‍💼 **Citoyen** : Dépôt & suivi de réclamations
  - 🧑‍💻 **Employé** : Traitement des demandes
  - 👨‍✈️ **Administrateur** : Supervision, gestion utilisateurs & statistiques

### 4. 💬 Chatbot intelligent multilingue
- Traduction automatique (Argos Translate)
- Détection d’émotions (modèle Hugging Face)
- Représentation sémantique (Sentence Transformers)
- Génération de réponses contextuelles (Microsoft Phi-2)
- Développement dans Google Colab – exécution sur GPU T4

---

## 🧪 Stack technique

| Composant         | Technologies / Bibliothèques utilisées                      |
|-------------------|-------------------------------------------------------------|
| Front-End         | React, CSS, React Router DOM                                |
| Back-End          | Node.js, Express, Axios, MySQL2, Bcrypt                     |
| Systèmes embarqués| Arduino IDE, ESP32, C/C++, capteurs divers                  |
| IA & NLP          | Argos Translate, Hugging Face, Phi-2, Sentence Transformers |
| Détection visuelle| TensorFlow, YOLOv5, OpenCV, Google Colab                    |
| Base de données   | MySQL, XAMPP                                                |

---

## 🧱 Méthodologie de développement

- 📐 Conception : Schémas électroniques, modélisation SysML (diagrammes de blocs, états, séquence)
- 🧪 Tests unitaires : capteurs, communication série, affichage
- 🔧 Intégration : progressive des modules (capteurs → actionneurs → communication ESP32)
- 🖥️ Développement web : React / Node → API → Base de données
- 🧠 IA : chatbot + deep learning caméra (modularité assurée)
- 🔁 Cycles d’amélioration continue, tests fonctionnels, documentation

---

## 🔒 Sécurité & robustesse

- 🔐 Authentification sécurisée via Bcrypt
- 🧼 Validation des entrées utilisateur
- 🔁 Limitation des tentatives de connexion
- 🔍 Contrôle d'accès RFID intégré côté matériel
- 📈 Journalisation des actions via l’interface admin

---

## 🚧 Travaux en cours & perspectives

- 📦 Amélioration de la couverture de la caméra 360°
- 🖼️ Annotation manuelle d’images pour enrichir les datasets
- 🧠 Entraînement de modèles personnalisés (objets spécifiques à détecter)
- 🔧 Déploiement potentiel sur Raspberry Pi ou serveur distant
- 📡 Ajout de la communication cloud pour supervision à distance
- 📱​ Création d'une application mobile
- ​🛡️​ Renforcement de la sécurité (chiffrement, JWT, déploiement sécurisé)
- 🐳 Conteneurisation avec Docker pour faciliter le déploiement multi-environnements
---

## 👨‍🎓 Remerciements

Je tiens à remercier chaleureusement **Monsieur Khalid Salhi** pour son encadrement tout au long de ce projet.  
Je remercie également la **Direction Régionale du Ministère de la Justice OUJDA** pour m’avoir accueilli dans le cadre de mon stage et permis de travailler sur un projet aussi enrichissant, tant sur le plan technique que professionnel.

---
## ​​🎓​ Douae LAMRINI
---

🎯 **Projet réalisé dans le cadre de stage de fin d’études à l'École Supérieure de Technologie d’Oujda (ESTO).**

