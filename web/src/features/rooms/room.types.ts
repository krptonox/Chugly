export type RoomVisibility = "public" | "private";
export type RoomMemberRole = "admin" | "member";

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export type RoomMember = {
  membershipId: string;
  displayName: string;
  role: RoomMemberRole;
  joinedAt: string;
};

export type RoomSummary = {
  _id: string;
  name: string;
  visibility: RoomVisibility;
  memberCount: number;
  maxMembers: number;
  distanceMeters?: number;
  isFull: boolean;
  isMember: boolean;
  isAdmin: boolean;
};

export type RoomDetail = RoomSummary & {
  members: RoomMember[];
};

export type CreateRoomPayload = {
  name: string;
  visibility: RoomVisibility;
  password?: string;
  latitude: number;
  longitude: number;
};

export type JoinRoomResponse = {
  room: RoomDetail;
  membership: RoomMember;
  alreadyMember: boolean;
};

export type LeaveRoomResponse = {
  roomId: string;
  deleted: boolean;
};
