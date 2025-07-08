import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data?.slice(startIndex, startIndex + itemsPerPage) || [];
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  return {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
    itemsPerPage
  };
};