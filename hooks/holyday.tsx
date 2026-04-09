import { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_CALENDARIFIC_API_KEY;;
type Holiday = {
  name: string;
  description: string;
  country: {
    id: string;
    name: string;
  };
  date: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
      hour?: number;
      minute?: number;
      second?: number;
    };
  };
  type: string[];
  primary_type: string;
  canonical_url: string;
  urlid: string;
  locations: string;
  states: string;
};

type ApiResponse = {
  meta: {
    code: number;
  };
  response: {
    holidays: Holiday[];
  };
};

export const useHolidays = (year = 2019, country = "IN") => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${country}&year=${year}`
        );

        const data: ApiResponse = await res.json();

        if (data.meta.code !== 200) {
          throw new Error("Failed to fetch holidays");
        }

        setHolidays(data.response.holidays);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [year, country]);

  return { holidays, loading, error };
};