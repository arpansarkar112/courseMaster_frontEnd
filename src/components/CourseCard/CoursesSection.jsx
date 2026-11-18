import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { getCourses } from "../../services/courses.api";
import CoursesFilters from "./CoursesFilters";
import CoursesGrid from "./CoursesGrid";
import CoursesPagination from "./CoursesPagination";

export default function CoursesSection() {
    const { user } = useSelector((state) => state.auth);
    const [searchParams, setSearchParams] = useSearchParams();

    const [courses, setCourses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // query states initialized from URL search params
    const [page, setPageState] = useState(() => Number(searchParams.get("page")) || 1);
    const [limit] = useState(8);
    const [search, setSearch] = useState(() => searchParams.get("search") || "");
    const [appliedSearch, setAppliedSearch] = useState(() => searchParams.get("search") || "");
    const [sort, setSortState] = useState(() => searchParams.get("sort") || "");
    const [category, setCategoryState] = useState(() => searchParams.get("category") || "");
    const [tags, setTagsState] = useState(() => searchParams.get("tags") || "");

    const syncUrlParams = useCallback(
        (nextState) => {
            const params = {};
            if (nextState.page && nextState.page > 1) params.page = String(nextState.page);
            if (nextState.search) params.search = nextState.search;
            if (nextState.sort) params.sort = nextState.sort;
            if (nextState.category) params.category = nextState.category;
            if (nextState.tags) params.tags = nextState.tags;
            setSearchParams(params, { replace: true });
        },
        [setSearchParams]
    );

    const setPage = (nextPage) => {
        setPageState(nextPage);
        syncUrlParams({ page: nextPage, search: appliedSearch, sort, category, tags });
    };

    const setSort = (nextSort) => {
        setSortState(nextSort);
        setPageState(1);
        syncUrlParams({ page: 1, search: appliedSearch, sort: nextSort, category, tags });
    };

    const setCategory = (nextCategory) => {
        setCategoryState(nextCategory);
        setPageState(1);
        syncUrlParams({ page: 1, search: appliedSearch, sort, category: nextCategory, tags });
    };

    const setTags = (nextTags) => {
        setTagsState(nextTags);
        setPageState(1);
        syncUrlParams({ page: 1, search: appliedSearch, sort, category, tags: nextTags });
    };

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit,
                search: appliedSearch || undefined,
                sort: sort || undefined,
                category: category || undefined,
                tags: tags || undefined,
            };

            const res = await getCourses(params);
            setCourses(res.data.courses || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load courses. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, appliedSearch, sort, category, tags]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = search.trim();
        setAppliedSearch(trimmed);
        setPageState(1);
        syncUrlParams({ page: 1, search: trimmed, sort, category, tags });
    };

    return (
        <div className="space-y-6">

            <CoursesFilters
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                category={category} setCategory={setCategory}
                tags={tags} setTags={setTags}
                onSearchSubmit={onSearchSubmit}
            />

            {/* states */}
            {loading && (
                <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {error && (
                <div className="alert alert-error flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={fetchCourses} className="btn btn-sm btn-outline">
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && courses.length === 0 && (
                <div className="rounded-xl border border-primary/20 bg-base-200 p-6 text-center">
                    <h3 className="text-lg font-semibold text-primary">
                        No courses found
                    </h3>
                    <p className="mt-1 text-base-content/70">
                        Try adjusting your search or filters.
                    </p>
                </div>
            )}


            {!loading && !error && courses.length > 0 && (
                <>
                    <CoursesGrid courses={courses} />
                    {user?.role === "admin" && (
                        <div className="flex justify-center pt-4">
                            <Link
                                to="/admin/courses"
                                className="btn btn-primary btn-wide"
                            >
                                Manage Courses
                            </Link>
                        </div>
                    )}
                </>
            )}

            <CoursesPagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />
        </div>
    );
}
