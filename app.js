(function () {
  const LANYARD = "https://api.lanyard.rest/v1/users/";

  function defaultAvatarUrl(userId) {
    const id = BigInt(userId);
    const idx = Number((id >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }

  function avatarUrl(user) {
    if (!user || !user.avatar) return defaultAvatarUrl(user.id);
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
  }

  function formatActivity(data) {
    if (!data) return "Not tracked — join Lanyard for live status";
    const spotify = data.spotify;
    if (spotify && spotify.track_id) {
      return `🎵 ${spotify.song} — ${spotify.artist}`;
    }
    const acts = data.activities || [];
    const custom = acts.find((a) => a.type === 4);
    if (custom && custom.state) return custom.state;
    const game = acts.find((a) => a.type === 0);
    if (game && game.name) {
      const det = [game.details, game.state].filter(Boolean).join(" · ");
      return det ? `${game.name} — ${det}` : game.name;
    }
    const status = data.discord_status;
    if (status === "online") return "Online";
    if (status === "idle") return "Away";
    if (status === "dnd") return "Do not disturb";
    return "Offline or not tracked";
  }

  function applyFallback(card, id) {
    const nameEl = card.querySelector("[data-username]");
    const actEl = card.querySelector("[data-activity]");
    const statusEl = card.querySelector("[data-status]");
    const img = card.querySelector("img.dc-card__avatar");
    const ph = card.querySelector(".dc-card__avatar--placeholder");
    const name = card.dataset.fallbackName || "Discord";

    nameEl.textContent = name;
    actEl.textContent = "Enable Lanyard (lanyard.rest) for live avatar & status.";
    statusEl.dataset.status = "offline";
    img.src = defaultAvatarUrl(id);
    img.alt = name;
    img.removeAttribute("hidden");
    ph.setAttribute("hidden", "");
  }

  async function loadCard(card) {
    const id = card.dataset.lanyardId;
    const img = card.querySelector("img.dc-card__avatar");
    const ph = card.querySelector(".dc-card__avatar--placeholder");
    const nameEl = card.querySelector("[data-username]");
    const actEl = card.querySelector("[data-activity]");
    const statusEl = card.querySelector("[data-status]");

    try {
      const res = await fetch(LANYARD + id, { mode: "cors" });
      const json = await res.json();

      if (json.success && json.data && json.data.discord_user) {
        const u = json.data.discord_user;
        const tag =
          u.discriminator && u.discriminator !== "0"
            ? `${u.username}#${u.discriminator}`
            : u.global_name || u.username;
        nameEl.textContent = tag;
        actEl.textContent = formatActivity(json.data);
        statusEl.dataset.status = json.data.discord_status || "offline";

        img.src = avatarUrl(u);
        img.alt = tag;
        img.removeAttribute("hidden");
        ph.setAttribute("hidden", "");
        return;
      }
    } catch (_) {
      /* use fallback */
    }

    applyFallback(card, id);
  }

  document.querySelectorAll("[data-lanyard-id]").forEach((card) => {
    loadCard(card);
  });
})();
