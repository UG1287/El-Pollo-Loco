document.addEventListener('DOMContentLoaded', () => {
    const explanationBtn = document.getElementById('explanationBtn');
    const startGameBtn = document.getElementById('startGameBtn');
    const modal = document.getElementById('explanationModal');
    const closeBtn = document.querySelector('.modal .close');
  
    explanationBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });
  
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    // Schließen, wenn irgendwo außerhalb des Modal-Inhalts geklickt wird
    window.addEventListener('click', (e) => {
      if (e.target == modal) {
        modal.style.display = 'none';
      }
    });
  
    // StartGame-Button ruft deine Spielstart-Funktion auf (z. B. startGame())
    startGameBtn.addEventListener('click', () => {
      // Hier kannst du den Startbildschirm ausblenden und das Spiel initialisieren
      // z. B. window.startGame();
    });
  });