import { Metadata } from "next";
import { db } from "@/lib/db";
import { Leaderboard, User } from "@prisma/client";

export const metadata: Metadata = {
  title: "Classement | LPT Défis",
  description: "Classement des participants sur LPT Défis",
};

type LeaderboardWithUser = Leaderboard & {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

async function getLeaderboard(): Promise<LeaderboardWithUser[]> {
  const leaderboard = await db.leaderboard.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      points: 'desc',
    },
    take: 100,
  });
  return leaderboard;
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Classement Global</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((entry, index) => (
              <tr 
                key={entry.id}
                className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`
                      flex items-center justify-center w-8 h-8 rounded-full
                      ${index === 0 ? 'bg-yellow-400 text-white' : ''}
                      ${index === 1 ? 'bg-gray-300 text-gray-800' : ''}
                      ${index === 2 ? 'bg-yellow-700 text-white' : ''}
                      ${index > 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''}
                    `}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {entry.user.image && (
                      <img
                        src={entry.user.image}
                        alt={entry.user.name || ""}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {entry.user.name || "Anonyme"}
                      </div>
                      {entry.user.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    {entry.points} points
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Rang #{index + 1}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 