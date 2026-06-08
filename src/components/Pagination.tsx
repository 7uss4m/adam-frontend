

import { useNavigate } from "react-router-dom";
import { usePagination } from "../hooks/usePagination";

function Pagination({
  siblingCount = 1,
  currentPage,
  totalPageCount
}: { siblingCount: number, currentPage: number, totalPageCount: number }) {
  const paginationRange = usePagination({
    currentPage,
    siblingCount,
    totalPageCount,
  });



  const navigate = useNavigate();
  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
    return null;
  }

  const onNext = () => {
    navigate(
      `?page=${Number(currentPage) + 1}`,
      {
        preventScrollReset: true,
      }
    );
  };

  const onPrevious = () => {
    navigate(
      `?page=${currentPage - 1}`,
      {
        preventScrollReset: true,
      }
    );
  };
  const lastPage = paginationRange ? paginationRange[paginationRange.length - 1] : null;
  return (
    <div dir="ltr" className="pagination mt-20">
      <ul className="flex justify-center items-center gap-5">
        {/* Left navigation arrow */}
        <li
          onClick={onPrevious}
          className={currentPage == 1 ? "pointer-events-none hidden" : ""}
        >
          <div
            className="arrow left size-8 flex justify-center items-center border-2 border-secondary rounded cursor-pointer hover:bg-secondary hover:text-white"
            style={currentPage == 1 ? { display: "none" } : {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 rotate-[180deg]"
            >
              <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
            </svg>
          </div>
        </li>
        {paginationRange && paginationRange.map((pageNumber, index) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber === "...") {
            return <li className="pagination-item dots" key={index}>&#8230;</li>;
          }

          // Render our Page Pills
          return (
            <li
              className={
                currentPage == pageNumber
                  ? "size-8 flex justify-center items-center rounded bg-secondary text-white cursor-pointer"
                  : "size-8 flex justify-center items-center rounded border-2 border-secondary text-green hover:bg-secondary hover:text-white transition cursor-pointer"
              }
              key={index}
              onClick={() => {
                navigate(
                  `?page=${pageNumber}`,
                  {
                    preventScrollReset: true,
                  }
                );
              }}
            >
              {pageNumber}
            </li>
          );
        })}
        {/*  Right Navigation arrow */}
        <li
          onClick={() => {
            onNext();
          }}
        >
          <div
            className="arrow right size-8 flex justify-center items-center border-2 border-secondary rounded cursor-pointer hover:bg-secondary hover:text-white"
            style={currentPage == lastPage ? { display: "none" } : {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Pagination;

