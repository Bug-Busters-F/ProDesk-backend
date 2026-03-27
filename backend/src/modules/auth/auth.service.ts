import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from '../user/dtos/createUserDTO';
import { UserDetails } from '../user/user.interface';
import { ExistingUserDTO } from '../user/dtos/existingUserDTO';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../user/user.schema';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService){
    }

    async hashPassword(password: string): Promise<string>{
        return bcrypt.hash(password, 12)
    }

    async register(user: Readonly<CreateUserDTO>): Promise<UserDetails | any>{
        const { name, email, password, role, companyId, groupId} =user;

        const existingUser = await this.userService.findByEmail(email);

        if (existingUser) throw new BadRequestException("Email taken!")

        const hashPassword = await this.hashPassword(password);

        const newUser = await this.userService.createUser(name, email, hashPassword, role, companyId, groupId);

        return this.userService._getUser(newUser)
    }

    async doesPasswordMatch(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password,hashedPassword)
    }

    async validateUser(email: string, password:string):
    Promise<UserDetails | null> {
        const user = await this.userService.findByEmail(email);
        const doesUserExist = !!user;

        if (!doesUserExist) return null;

        const doesPasswordMatch = await this.doesPasswordMatch(password,
            user.password);
        
        if (!doesPasswordMatch) return null;

        return this.userService._getUser(user);
    }

    async login(existingUser: ExistingUserDTO): Promise<{token: string} | null>{
        const {email, password} = existingUser;
        const user = await this.validateUser(email, password);

        if (!user) return null;

        const jwt = await this.jwtService.signAsync({sub: user.id, email: user.email, role: user.role});
        return {token: jwt};
    }

    async createFirstAdmin(){
        const admin = {
            name : "admin",
            email : "admin@pro4tech.com", 
            password : "Pro4Tech",
            role : UserRole.ADMIN
        }

        const user = await this.userService.findByEmail(admin.email);
        const doesUserExist = !!user;

        if (!doesUserExist){
            this.register(admin)
        };

    }
}
