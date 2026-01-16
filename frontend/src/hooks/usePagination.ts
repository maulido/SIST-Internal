import { useState } from 'react';

export function usePagination(items: any[], itemsPerPage: number = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const currentItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return {
        currentPage,
        currentItems,
        totalPages,
        paginate,
        totalItems: items.length
    };
}
