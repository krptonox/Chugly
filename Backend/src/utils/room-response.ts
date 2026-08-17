import type { Types } from "mongoose";

import type { IRoom } from "../models/room.model.js";
import type {
    IRoomMember,
    NearbyRoomAggregate,
    RoomDetailResponse,
    RoomMemberResponse,
    RoomSummaryResponse,
} from "../types/room.types.js";

type RoomSummarySource = Pick<
    IRoom,
    "_id" | "name" | "visibility" | "memberCount" | "maxMembers"
> & {
    createdBy?: Types.ObjectId | string;
    members?: IRoomMember[];
    distanceMeters?: number;
    isMember?: boolean;
    isAdmin?: boolean;
};

const idToString = (id: Types.ObjectId | string): string =>
    id.toString();

const userIsMember = (
    members: IRoomMember[] | undefined,
    userId: Types.ObjectId | undefined
): boolean => {
    if (!members || !userId) {
        return false;
    }

    return members.some((member) => member.user.equals(userId));
};

export const toMembershipResponse = (
    member: IRoomMember
): RoomMemberResponse => ({
    membershipId: idToString(member._id),
    displayName: member.displayName,
    role: member.role,
    joinedAt: member.joinedAt,
});

export const toRoomSummary = (
    room: RoomSummarySource,
    userId?: Types.ObjectId
): RoomSummaryResponse => {
    const isMember =
        room.isMember ?? userIsMember(room.members, userId);
    const isAdmin =
        room.isAdmin ??
        Boolean(
            room.createdBy &&
                userId &&
                idToString(room.createdBy) === idToString(userId)
        );

    return {
        _id: idToString(room._id),
        name: room.name,
        visibility: room.visibility,
        memberCount: room.memberCount,
        maxMembers: room.maxMembers,
        ...(room.distanceMeters === undefined
            ? {}
            : { distanceMeters: room.distanceMeters }),
        isFull: room.memberCount >= room.maxMembers,
        isMember,
        isAdmin,
    };
};

export const toRoomDetail = (
    room: IRoom,
    userId: Types.ObjectId
): RoomDetailResponse => {
    const summary = toRoomSummary(room, userId);
    const isMember = summary.isMember || summary.isAdmin;

    return {
        ...summary,
        members: isMember
            ? room.members.map(toMembershipResponse)
            : [],
    };
};

export const toNearbyRoomSummary = (
    room: NearbyRoomAggregate
): RoomSummaryResponse => toRoomSummary(room);
