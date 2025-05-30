document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        let participantsHTML = '';
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `
            <div class="activity-participants">
              <div class="activity-participants-title">Participants:</div>
              <ul class="activity-participants-list">
                ${details.participants.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="activity-participants">
              <div class="activity-participants-title">Participants:</div>
              <div class="activity-participants-list" style="color:#b8c1ec; font-size:15px;">No participants yet</div>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
          <button class="signup-btn" data-activity="${name}">Sign Up</button>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Botón de inscripción abre el modal
      document.querySelectorAll('.signup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const activity = btn.getAttribute('data-activity');
          document.getElementById('signup-modal').classList.remove('hidden');
          document.getElementById('modal-activity-title').textContent = `Sign Up for ${activity}`;
          document.getElementById('modal-activity').value = activity;
          document.getElementById('message').classList.add('hidden');
          document.getElementById('email').value = '';
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Modal close
  document.getElementById('close-modal').onclick = () => {
    document.getElementById('signup-modal').classList.add('hidden');
  };
  window.onclick = (event) => {
    if (event.target === document.getElementById('signup-modal')) {
      document.getElementById('signup-modal').classList.add('hidden');
    }
  };

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const activity = document.getElementById("modal-activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success message";
        signupForm.reset();
        setTimeout(() => {
          document.getElementById('signup-modal').classList.add('hidden');
        }, 1200);
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error message";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
