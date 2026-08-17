import type { Types } from "mongoose";

export type RoomVisibility = "public" | "private";
export type RoomMemberRole = "admin" | "member";

export interface RoomLocation {
    type: "Point";
    coordinates: [number, number];
}

export interface IRoomMember {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    displayName: string;
    role: RoomMemberRole;
    joinedAt: Date;
}

export interface CreateRoomInput {
    name: string;
    visibility: RoomVisibility;
    password?: string;
    latitude: number;
    longitude: number;
}

export interface NearbyRoomAggregate {
    _id: Types.ObjectId;
    name: string;
    visibility: RoomVisibility;
    createdBy: Types.ObjectId;
    memberCount: number;
    maxMembers: number;
    distanceMeters: number;
    isMember: boolean;
    isAdmin: boolean;
}

export interface RoomMemberResponse {
    membershipId: string;
    displayName: string;
    role: RoomMemberRole;
    joinedAt: Date;
}

export interface RoomSummaryResponse {
    _id: string;
    name: string;
    visibility: RoomVisibility;
    memberCount: number;
    maxMembers: number;
    distanceMeters?: number;
    isFull: boolean;
    isMember: boolean;
    isAdmin: boolean;
}

export interface RoomDetailResponse extends RoomSummaryResponse {
    members: RoomMemberResponse[];
}
