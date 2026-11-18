import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children, me, loading = false }) {
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!me) return <Navigate to="/login" state={{ from: location }} replace />;
    if (me.role !== "admin") return <Navigate to="/student" replace />;
    return children;
}
