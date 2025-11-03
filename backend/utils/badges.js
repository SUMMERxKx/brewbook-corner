// Badge system based on points
function updateBadges(points) {
  if (points >= 500) {
    return ["Caffeine Legend"];
  }
  if (points >= 200) {
    return ["Master Brewer"];
  }
  if (points >= 50) {
    return ["Brewer"];
  }
  return ["Novice"];
}

// Get badge info for display
function getBadgeInfo(badges) {
  const badgeConfig = {
    "Novice": { name: "Novice", icon: "🌱", color: "text-gray-600", bgColor: "bg-gray-100" },
    "Brewer": { name: "Brewer", icon: "☕", color: "text-amber-600", bgColor: "bg-amber-100" },
    "Master Brewer": { name: "Master Brewer", icon: "⭐", color: "text-purple-600", bgColor: "bg-purple-100" },
    "Caffeine Legend": { name: "Caffeine Legend", icon: "👑", color: "text-yellow-600", bgColor: "bg-yellow-100" }
  };

  const currentBadge = badges && badges.length > 0 ? badges[0] : "Novice";
  return badgeConfig[currentBadge] || badgeConfig["Novice"];
}

// Get next badge threshold
function getNextBadgeThreshold(currentPoints) {
  if (currentPoints < 50) return { threshold: 50, badge: "Brewer", remaining: 50 - currentPoints };
  if (currentPoints < 200) return { threshold: 200, badge: "Master Brewer", remaining: 200 - currentPoints };
  if (currentPoints < 500) return { threshold: 500, badge: "Caffeine Legend", remaining: 500 - currentPoints };
  return { threshold: null, badge: "Max Level", remaining: 0 };
}

module.exports = { updateBadges, getBadgeInfo, getNextBadgeThreshold };

