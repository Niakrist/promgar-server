import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    PrismaModule,
    AuthModule,
    DictionariesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
