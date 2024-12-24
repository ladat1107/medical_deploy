import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MainContextProvider from "@/contexts/MainContext";
function MainLayout() {
    return (
        <MainContextProvider>
            <Header />
            <Outlet />
            <Footer />
        </MainContextProvider>
    );
}

export default MainLayout;
