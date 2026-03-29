'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractCampusLocation } from '../lib/campusMap';

type CampusMapFrameProps = {
  room: string | null;
  title?: string;
};

const APPLY_DELAY_MS = 300;
const MAX_APPLY_ATTEMPTS = 50;
const MAP_TARGET_STYLE_ID = 'codex-map-highlight-style';

function setInputValue(input: HTMLInputElement, value: string) {
  const inputPrototype = input.ownerDocument.defaultView?.HTMLInputElement.prototype;
  const descriptor = inputPrototype
    ? Object.getOwnPropertyDescriptor(inputPrototype, 'value')
    : null;
  descriptor?.set?.call(input, value);
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const selectPrototype = select.ownerDocument.defaultView?.HTMLSelectElement.prototype;
  const descriptor = selectPrototype
    ? Object.getOwnPropertyDescriptor(selectPrototype, 'value')
    : null;
  descriptor?.set?.call(select, value);
}

function createFrameEvent(frameDocument: Document, type: string): Event {
  const FrameEvent = frameDocument.defaultView?.Event as typeof Event | undefined;
  return new (FrameEvent ?? Event)(type, { bubbles: true });
}

function ensureHighlightStyles(frameDocument: Document) {
  if (frameDocument.getElementById(MAP_TARGET_STYLE_ID)) {
    return;
  }

  const style = frameDocument.createElement('style');
  style.id = MAP_TARGET_STYLE_ID;
  style.textContent = `
    .codex-map-target,
    .codex-map-target line,
    .codex-map-target polygon,
    .codex-map-target polyline {
      fill: #ff5a54 !important;
      stroke: #8f1d1d !important;
      stroke-width: 1.2 !important;
      filter: drop-shadow(0 0 0.4rem rgba(255, 90, 84, 0.55)) !important;
    }
    .codex-map-target path,
    .codex-map-target text,
    .codex-map-target span {
      color: #ffffff !important;
      fill: #ffffff !important;
      stroke: #ffffff !important;
    }
  `;

  frameDocument.head.appendChild(style);
}

function getRoomCandidates(room: string): string[] {
  const location = extractCampusLocation(room);
  const canonicalRoom = room.toUpperCase().trim();
  const roomCode = location?.roomCode?.toUpperCase();
  const shortRoom = canonicalRoom.replace(/^C1\.\d\./, '');
  const candidates = [canonicalRoom, shortRoom, roomCode].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

function applyRoomHighlight(frameDocument: Document, room: string): boolean {
  ensureHighlightStyles(frameDocument);

  const candidates = getRoomCandidates(room);
  const nodes = Array.from(frameDocument.querySelectorAll<HTMLElement>('[data-name]'));

  nodes.forEach((node) => {
    node.classList.remove('codex-map-target');
    node.classList.remove('room-map-group-search-target');
    const group = node.closest<HTMLElement>('g');
    group?.classList.remove('codex-map-target');
  });

  const matchedNodes = nodes.filter((node) => {
    const name = node.dataset.name?.toUpperCase().trim();
    if (!name) {
      return false;
    }

    return candidates.some((candidate) => name === candidate || name.includes(candidate));
  });

  matchedNodes.forEach((node) => {
    node.classList.add('room-map-group-search-target', 'codex-map-target');
    node.closest<HTMLElement>('g')?.classList.add('codex-map-target');
  });

  return matchedNodes.length > 0;
}

export default function CampusMapFrame({
  room,
  title = 'AITU campus map',
}: CampusMapFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [isApplyingRoom, setIsApplyingRoom] = useState(Boolean(room));

  const tryApplyRoom = useCallback(() => {
    if (!room) {
      setIsApplyingRoom(false);
      return true;
    }

    const iframe = iframeRef.current;
    const frameDocument = iframe?.contentDocument;
    const location = extractCampusLocation(room);
    const searchInput = frameDocument?.getElementById('search__chakra-input') as HTMLInputElement | null;
    const blockSelect = frameDocument?.getElementById('search__select-block') as HTMLSelectElement | null;
    const floorButton = location
      ? frameDocument?.querySelector<HTMLButtonElement>(`.floor-option__button[name="${location.floorCode}"]`)
      : null;

    if (!frameDocument || !searchInput) {
      return false;
    }

    if (location && blockSelect && blockSelect.value !== location.blockCode) {
      setSelectValue(blockSelect, location.blockCode);
      blockSelect.dispatchEvent(createFrameEvent(frameDocument, 'change'));
    }

    if (floorButton && !floorButton.className.includes('floor-option__button_current-floor')) {
      floorButton.click();
    }

    setInputValue(searchInput, room);
    searchInput.dispatchEvent(createFrameEvent(frameDocument, 'input'));
    searchInput.dispatchEvent(createFrameEvent(frameDocument, 'change'));

    const didHighlightRoom = applyRoomHighlight(frameDocument, room);
    setIsApplyingRoom(!didHighlightRoom);

    return didHighlightRoom;
  }, [room]);

  useEffect(() => {
    if (!frameLoaded) {
      setIsApplyingRoom(Boolean(room));
      return;
    }

    let attempts = 0;
    setIsApplyingRoom(Boolean(room));

    const intervalId = window.setInterval(() => {
      attempts += 1;

      if (tryApplyRoom() || attempts >= MAX_APPLY_ATTEMPTS) {
        window.clearInterval(intervalId);
        if (attempts >= MAX_APPLY_ATTEMPTS) {
          setIsApplyingRoom(false);
        }
      }
    }, APPLY_DELAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [frameLoaded, room, tryApplyRoom]);

  return (
    <div className="map-frame">
      {isApplyingRoom && (
        <div className="map-frame__loading" role="status" aria-live="polite">
          Loading map for {room}...
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="map-frame__iframe"
        src="/aitumap/"
        title={title}
        onLoad={() => setFrameLoaded(true)}
      />
    </div>
  );
}
