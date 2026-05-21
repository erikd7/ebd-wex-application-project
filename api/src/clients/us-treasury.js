//https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange
import { today, sixMonthsAgo } from "../util/date.js";
import log from "../util/logger.js";
import { ApiError } from "../util/error.js";
import { StatusCodes } from "http-status-codes";

// TODO: Cache exchange rates with automated cache refresh. Per docs the data is only updated quarterly so cache could be pretty long-lived.
const retrieveReportingRatesOfExchange = async (
  countryCurrencyDesc,
  fromDateString = today,
  toDateString = sixMonthsAgo(today)
) => {
  const baseUrl =
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/";
  const path = "v1/accounting/od/rates_of_exchange";

  // Limit to only needed fields
  const fieldsToRetreive = ["effective_date", "exchange_rate"];
  const fields = `fields=${fieldsToRetreive.join(",")}`;

  // Filter by country-currency description (e.g. "Afghanistan-Afghani"))
  let filters = `filter=country_currency_desc:eq:${countryCurrencyDesc}`;

  // effective_date must be greater than/equal to from date and less than/equal to to date
  filters =
    filters +
    `,effective_date:gte:${fromDateString},effective_date:lte:${toDateString}`;

  // Most recent records first
  const sorting = "sort=-effective_date";

  // Build URL with params
  const url = baseUrl + path + `?${fields}&${filters}&${sorting}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error fetching reporting rates of exchange: ${response.statusText} - ${JSON.stringify(data)}`
      );
    }

    const { data: exchangeRates } = data;

    return exchangeRates;
  } catch (error) {
    log.error(error);

    throw new ApiError(
      "An error occurred while retrieving reporting rates of exchange",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const getMostRecentExchangeRateForCountryCurrencyDesc = async (
  countryCurrencyDesc,
  fromDate,
  toDate
) => {
  const exchangeRates = await retrieveReportingRatesOfExchange(
    countryCurrencyDesc,
    fromDate,
    toDate
  );

  if (exchangeRates?.length) {
    return exchangeRates[0].exchange_rate;
  }
};

export {
  getMostRecentExchangeRateForCountryCurrencyDesc,
  retrieveReportingRatesOfExchange,
};
