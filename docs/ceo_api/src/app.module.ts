import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { CoreModule } from './modules/core/core.module';

// New English modules (refactored from Portuguese)
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContentModule } from './modules/content/content.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FileUploadModule } from './modules/upload/file-upload.module';
import { EquipamentModule } from './modules/equipament/equipament.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { SupportModule } from './modules/support/support.module';
import { TrainingModule } from './modules/training/training.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { EmailModule } from './modules/email/email.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommunityModule } from './modules/community/community.module';
// import { NoticiasExternasModule } from './modules/noticias-externas/noticias-externas.module';

// HR Modules
import { CalendarModule } from './modules/calendar/calendar.module';
import { AbsencesModule } from './modules/absences/absences.module';
import { TimesheetsModule } from './modules/timesheets/timesheets.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),

    // Core
    DatabaseModule,
    AuthModule,
    CoreModule,

    // Modules
    TenantsModule,
    EmployeesModule,
    CompaniesModule,
    ClientsModule,
    SuppliersModule,
    LeadsModule,
    ProductsModule,
    SalesOrdersModule,
    EmailModule,
    TransactionsModule,
    QuotesModule,
    ContentModule,
    ReviewsModule,
    EquipamentModule,
    FileUploadModule,
    MailerModule,
    SupportModule,
    TrainingModule,
    CommunityModule,
    // New English modules
    PermissionsModule,
    UserProfilesModule,
    UsersModule,
    // NoticiasExternasModule,
    // HR Modules
    CalendarModule,
    AbsencesModule,
    TimesheetsModule,
    ShiftsModule,
    HolidaysModule,
    PerformanceModule,
    ExpensesModule,
    OnboardingModule,
  ],
  providers: [
    // Global guard (JWT em todas as rotas exceto Auth)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
