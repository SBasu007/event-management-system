import Link from "next/link";

export default function EventCard({
  eventId,
  title,
  description,
  event_date,
  event_time,
  img_url,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {img_url ? (
          <img
            src={img_url}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-blue-500 text-white text-sm">
            No Image Available
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {description}
        </p>

        {/* Date and Time */}
        <div className="flex flex-col gap-2 text-sm border-t pt-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">📅</span>
            <span className="text-gray-700">{event_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">🕐</span>
            <span className="text-gray-700">{event_time}</span>
          </div>
        </div>

        {/* Action Button */}
        {eventId ? (
          <Link
            href={`/events/${eventId}`}
            className="mt-2 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors duration-200 hover:bg-blue-700"
          >
            View Details
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2 font-medium text-white"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
