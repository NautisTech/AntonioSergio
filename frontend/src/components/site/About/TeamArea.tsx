"use client"

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const TeamArea = () => {
   const { t } = useTranslation("about");
   const teams = [
      {
         _id: '1',
         name: t("team.members.0.name"),
         designation: t("team.members.0.designation"),
         team_sm_img: '/assets/img/team/team-sm-1.png',
         shape: '/assets/img/team/team-shape-1',
         social: {
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            pinterest: '#'
         }
      },
      {
         _id: '2',
         name: t("team.members.1.name"),
         designation: t("team.members.1.designation"),
         team_sm_img: '/assets/img/team/team-sm-2.png',
         shape: '/assets/img/team/team-shape-2',
         social: {
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            pinterest: '#'
         }
      },
      {
         _id: '3',
         name: t("team.members.2.name"),
         designation: t("team.members.2.designation"),
         team_sm_img: '/assets/img/team/team-sm-3.png',
         shape: '/assets/img/team/team-shape-3',
         social: {
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            pinterest: '#'
         }
      },
      {
         _id: '4',
         name: t("team.members.3.name"),
         designation: t("team.members.3.designation"),
         team_sm_img: '/assets/img/team/team-sm-4.png',
         shape: '/assets/img/team/team-shape-4',
         social: {
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            pinterest: '#'
         }
      }
   ];

   return (
      <>
         <section id="educational-project" className="team__area pt-115">
            <div className="container">
               <div className="row align-items-end">
                  <div className="col-xxl-6 col-xl-6 col-lg-6">
                     <div className="section__title-wrapper-2 mb-40">
                        <span className="section__title-pre-2">{t("team.pre_title")}</span>
                        <h3 className="section__title-2">{t("team.title")}</h3>
                     </div>
                  </div>
                  <div className="col-xxl-6 col-xl-6 col-lg-6">
                     <div className="team__wrapper mb-45 pl-70">
                        <p>{t("team.description")}</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  {teams.map(team => {
                     return <div key={team?._id} className="col-xxl-3 col-xl-3 col-lg-4 col-md-6">
                        <div className="team__item text-center mb-40">
                           <div className="team__thumb">
                              <div className="team__shape">
                                 <img src={team?.shape} alt="" />
                              </div>
                              <img src={team?.team_sm_img} alt="" />
                              <div className="team__social transition-3">
                                 <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                                 <a href="#"><i className="fa-brands fa-twitter"></i></a>
                                 <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                                 <a href="#"><i className="fa-brands fa-pinterest-p"></i></a>
                              </div>
                           </div>
                           <div className="team__content">
                              <h3 className="team__title">
                                 <Link href={`/team-details/${team?._id}`}>
                                    {team?.name}
                                 </Link>
                              </h3>
                              <span className="team__designation">{team?.designation}</span>
                           </div>
                        </div>
                     </div>
                  })}
               </div>
            </div>
         </section>
      </>
   );
};

export default TeamArea;