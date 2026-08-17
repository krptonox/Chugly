import type { ApiResponse } from "../../lib/api-types";
import { apiClient } from "../../lib/api-client";
import type {
  CreateRoomPayload,
  JoinRoomResponse,
  LeaveRoomResponse,
  RoomDetail,
  RoomSummary,
} from "./room.types";

export const roomApi = {
  getNearbyRooms: (latitude: number, longitude: number) =>
    apiClient.get<ApiResponse<RoomSummary[]>>("/rooms/nearby", {
      params: { latitude, longitude },
    }),

  getMyRooms: () =>
    apiClient.get<ApiResponse<RoomSummary[]>>("/rooms/mine"),

  getRoom: (roomId: string) =>
    apiClient.get<ApiResponse<RoomDetail>>(
      `/rooms/${encodeURIComponent(roomId)}`
    ),

  createRoom: (payload: CreateRoomPayload) =>
    apiClient.post<ApiResponse<RoomDetail>>("/rooms", payload),

  joinRoom: (roomId: string, password?: string) =>
    apiClient.post<ApiResponse<JoinRoomResponse>>(
      `/rooms/${encodeURIComponent(roomId)}/join`,
      password ? { password } : {}
    ),

  leaveRoom: (roomId: string) =>
    apiClient.post<ApiResponse<LeaveRoomResponse>>(
      `/rooms/${encodeURIComponent(roomId)}/leave`
    ),

  removeRoomMember: (roomId: string, membershipId: string) =>
    apiClient.delete<ApiResponse<RoomDetail>>(
      `/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(membershipId)}`
    ),
};
