import React from 'react'

const LendersLayout = () => {
    return (
        <section className="sidebar">
            <div className="icon">
                <img src="/assets/images/homeLogo.png" alt="Logo" />
                <h2 className="logo-text"><span className="sideName">NestNova</span></h2>
            </div>

            <section id="sideMenu">
                <div className="menu">
                    <ul>
                        <li className="active" title="Overview">
                            <Link to="/lenders/lenderDash.html"><i className="bi bi-house"></i><span className="sideName">
                                Overview</span></Link>
                        </li>
                        <li title="Offers">
                            <Link to="#"><i className="bi bi-file-text"></i><span className="sideName"> Offers</span></Link>
                            <div className="redDot"></div>
                        </li>
                        <li title="Clients">
                            <Link to="#"><i className="bi bi-people"></i><span className="sideName"> Clients</span></Link>
                        </li>
                        <li title="Chats">
                            <Link to="#"><i className="bi bi-chat-dots"></i><span className="sideName"> Chats</span></Link>
                            <div className="redDot"></div>
                        </li>
                    </ul>
                </div>

                <div className="financial">
                    <ul>
                        <li title="Transaction">
                            <Link to="#"><i className="bi bi-wallet2"></i> <span className="sideName">Transaction
                                Logs</span></Link>
                        </li>
                    </ul>
                </div>

                <div className="history">
                    <ul>
                        <li title="History">
                            <Link to="#"><i className="bi bi-clock-history"></i> <span className="sideName">History</span></Link>
                        </li>
                    </ul>
                </div>



            </section>

            <div className="setting">
                <ul>
                    <li title="Setting">
                        <Link to="/lenders/lenderSetting.html"><i className="bi bi-gear"></i><span className="sideName">Account
                            Setting</span></Link>
                    </li>
                    <li className="logout" id="verifyLogout" title="Logout">
                        <i className="bi bi-box-arrow-in-left"></i>
                        <span className="sideName">Logout</span>
                    </li>
                </ul>

            </div>
        </section>
    )
}

export default LendersLayout
