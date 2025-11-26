"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Pagination({ className, filters = {}, pagination }) {
	const router = useRouter();

	// Don't render if no pagination data or only 1 page
	if (!pagination || pagination.totalPages <= 1) {
		return null;
	}

	const { page = 1, totalPages } = pagination;
	const currentPage = filters.page || page;

	// Build URL with current filters
	const buildUrl = newPage => {
		const params = new URLSearchParams();

		if (newPage > 1) params.set("page", newPage.toString());
		if (filters.categoryId)
			params.set("categoryId", filters.categoryId.toString());
		if (filters.tags) params.set("tags", filters.tags);
		if (filters.search) params.set("search", filters.search);

		const query = params.toString();
		return query ? `/blog?${query}` : "/blog";
	};

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			router.push(buildUrl(newPage));
		}
	};

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = 7;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				if (!pages.includes(i)) {
					pages.push(i);
				}
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			// Always show last page
			if (!pages.includes(totalPages)) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div
			className={className ? className : "pagination justify-content-center"}
		>
			{/* Previous Page Button */}
			<a
				onClick={() => handlePageChange(currentPage - 1)}
				className={currentPage === 1 ? "disabled" : ""}
				style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
			>
				<i className="mi-chevron-left" />
				<span className="visually-hidden">Previous page</span>
			</a>

			{/* Page Numbers */}
			{pageNumbers.map((pageNum, index) =>
				pageNum === "..." ? (
					<span key={`ellipsis-${index}`} className="no-active">
						...
					</span>
				) : (
					<a
						key={pageNum}
						onClick={() => handlePageChange(pageNum)}
						className={currentPage === pageNum ? "active" : ""}
						style={{ cursor: "pointer" }}
					>
						{pageNum}
					</a>
				)
			)}

			{/* Next Page Button */}
			<a
				onClick={() => handlePageChange(currentPage + 1)}
				className={currentPage === totalPages ? "disabled" : ""}
				style={{
					cursor:
						currentPage === totalPages ? "not-allowed" : "pointer",
				}}
			>
				<i className="mi-chevron-right" />
				<span className="visually-hidden">Next page</span>
			</a>
		</div>
	);
}
