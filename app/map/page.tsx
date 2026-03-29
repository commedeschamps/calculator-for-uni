import Link from 'next/link';
import CampusMapFrame from '../components/CampusMapFrame';
import CopyButton from '../components/CopyButton';
import PageLayout from '../components/PageLayout';
import { extractCampusLocation, getCampusLocationSummary } from '../lib/campusMap';

type SearchParams = Record<string, string | string[] | undefined>;

type MapPageProps = {
  searchParams?: SearchParams;
};

function getSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function MapPage({ searchParams }: MapPageProps) {
  const roomParam = getSingleValue(searchParams?.room);
  const subjectParam = getSingleValue(searchParams?.subject);
  const dayParam = getSingleValue(searchParams?.day);
  const timeParam = getSingleValue(searchParams?.time);

  const location = extractCampusLocation(roomParam);
  const selectedRoom = location?.canonicalRoom ?? null;
  const summary = location ? getCampusLocationSummary(location) : null;

  return (
    <PageLayout title="Campus Map">
      <section className="map-toolbar">
        <div className="map-toolbar__main">
          <h2 className="map-toolbar__room">{selectedRoom ?? 'AITU Campus Map'}</h2>

          <div className="map-meta-list">
            {summary && <div className="map-meta-chip map-meta-chip--summary">{summary}</div>}
            {subjectParam && <div className="map-meta-chip">{subjectParam}</div>}
            {dayParam && <div className="map-meta-chip">{dayParam}</div>}
            {timeParam && <div className="map-meta-chip">{timeParam}</div>}
          </div>
        </div>

        <div className="map-actions">
          {selectedRoom && (
            <div className="map-pill">
              <span>{selectedRoom}</span>
              <CopyButton value={selectedRoom} label="Copy room" />
            </div>
          )}
          <Link className="btn btn-muted" href="/schedule">
            Back to Schedule
          </Link>
          <a
            className="btn btn-muted"
            href="https://yuujiso.github.io/aitumap/"
            target="_blank"
            rel="noreferrer"
          >
            Original
          </a>
        </div>
      </section>

      {roomParam && !location && (
        <div className="map-warning">
          Room not recognized: {roomParam}
        </div>
      )}

      <section className="map-card map-card--viewer">
        <div className="map-card__topline">
          {selectedRoom && <span className="map-card__status">Room highlighted</span>}
        </div>
        <CampusMapFrame
          room={selectedRoom}
          title={selectedRoom ? `AITU map for ${selectedRoom}` : 'AITU campus map'}
        />
      </section>
    </PageLayout>
  );
}
