// src/some-module/some.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('protected')
export class SomeController {
    @Get()
    @UseGuards(AuthGuard('jwt'))
    getProtectedResource() {
        return "This is a protected resource";
    }
}
