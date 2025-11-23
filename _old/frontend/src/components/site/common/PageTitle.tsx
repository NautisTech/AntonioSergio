export const PageTitle = ({ title, subtitle }: { title: string, subtitle: string }) => {
    return (
        <section className="page__title-area pt-120 pb-90 crimson-bg">
            <div className="container">
                <div className="row">
                    <div className="col-xxl-12">
                        <div className="page__title-wrapper text-center">
                            <h1 className="page__title text-white">{title}</h1>
                            <p className="text-white">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};