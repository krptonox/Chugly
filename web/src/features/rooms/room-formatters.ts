export function formatDistance(distanceMeters?: number) {
  if (distanceMeters === undefined) {
    return "Nearby";
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m away`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km away`;
}

export function formatMemberCount(memberCount: number, maxMembers: number) {
  return `${memberCount}/${maxMembers} members`;
}

export function getMemberInitial(displayName: string) {
  return displayName.charAt(0).toUpperCase() || "?";
}

export function getMemberAvatarTone(displayName: string) {
  const tones = ["bg-sage text-moss", "bg-[#f6dfc9] text-[#8a5128]", "bg-[#e5def2] text-[#654b8a]", "bg-[#dce8ef] text-[#315b72]"];
  const hash = Array.from(displayName).reduce((total, character) => total + character.charCodeAt(0), 0);
  return tones[hash % tones.length];
}

export function formatJoinedAt(joinedAt: string) {
  const date = new Date(joinedAt);

  if (Number.isNaN(date.getTime())) {
    return "Member";
  }

  return `Joined ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}
