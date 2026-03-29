export type CampusLocation = {
  canonicalRoom: string;
  blockCode: 'B1' | 'B2' | 'B3';
  blockLabel: 'C1.1' | 'C1.2' | 'C1.3';
  floorCode: 'F1' | 'F2' | 'F3';
  floorNumber: 1 | 2 | 3;
  roomCode: string;
};

const ROOM_PATTERN = /C1\.(1|2|3)\.([1-3]\d{2}[A-Z]?)/i;

export function extractCampusLocation(classroom: string | null | undefined): CampusLocation | null {
  if (!classroom) {
    return null;
  }

  const match = classroom.match(ROOM_PATTERN);
  if (!match) {
    return null;
  }

  const [, blockNumberRaw, roomCodeRaw] = match;
  const blockNumber = Number(blockNumberRaw) as 1 | 2 | 3;
  const roomCode = roomCodeRaw.toUpperCase();
  const floorNumber = Number(roomCode.charAt(0)) as 1 | 2 | 3;

  return {
    canonicalRoom: `C1.${blockNumber}.${roomCode}`,
    blockCode: `B${blockNumber}` as CampusLocation['blockCode'],
    blockLabel: `C1.${blockNumber}` as CampusLocation['blockLabel'],
    floorCode: `F${floorNumber}` as CampusLocation['floorCode'],
    floorNumber,
    roomCode,
  };
}

export function getCampusLocationSummary(location: CampusLocation): string {
  return `${location.blockLabel} • Floor ${location.floorNumber} • Room ${location.roomCode}`;
}
