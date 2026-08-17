import type { FieldErrors } from "../../lib/api-errors";
import type { RoomVisibility } from "./room.types";

export const validateCreateRoom = (
  name: string,
  visibility: RoomVisibility,
  password: string,
  hasLocation: boolean
): FieldErrors => {
  const errors: FieldErrors = {};
  const trimmedName = name.trim();

  if (!trimmedName) {
    errors.name = "Room name is required.";
  } else if (trimmedName.length > 80) {
    errors.name = "Room name cannot exceed 80 characters.";
  }

  if (visibility !== "public" && visibility !== "private") {
    errors.visibility = "Choose a public or private room.";
  }

  if (visibility === "private") {
    if (!password.trim()) {
      errors.password = "Private rooms require a password.";
    } else if (password.length < 8 || password.length > 128) {
      errors.password =
        "Room password must be between 8 and 128 characters.";
    }
  }

  if (!hasLocation) {
    errors.location =
      "Your current location is required to create a room.";
  }

  return errors;
};
