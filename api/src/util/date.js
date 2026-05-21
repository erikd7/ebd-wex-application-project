const sixMonthsAgo = (dateString) => {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() - 6);

  return date.toISOString().split("T")[0];
};

const today = new Date().toISOString().split("T")[0];

export { sixMonthsAgo, today };
